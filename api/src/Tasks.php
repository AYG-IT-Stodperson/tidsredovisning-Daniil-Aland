<?php

declare (strict_types=1);
require_once __DIR__ . '/activities.php';

function tasklists(Route $route): Response {

    try {
        if (count($route->getParams()) === 1 && $route->getMethod() === RequestMethod::GET) {
            return hamtaSida($route->getParams()[0]);
        }
        if (count($route->getParams()) === 2 && $route->getMethod() === RequestMethod::GET) {
            return hamtaDatum($route->getParams()[0], $route->getParams()[1]);
        }
    } catch (Exception $exc) {
        return new Response($exc->getMessage(), 400);
    }

    return new Response("Okänt anrop", 400);
}


function tasks(Route $route, array $postData): Response {

    try {
        if (count($route->getParams()) === 1 && $route->getMethod() === RequestMethod::GET) {
            return hamtaEnskildUppgift($route->getParams()[0]);
        }
        if (count($route->getParams()) === 0 && $route->getMethod() === RequestMethod::POST) {
            return sparaNyUppgift($postData);
        }
        if (count($route->getParams()) === 1 && $route->getMethod() === RequestMethod::PUT) {
            return uppdateraUppgift( $route->getParams()[0], $postData);
        }
        if (count($route->getParams()) === 1 && $route->getMethod() === RequestMethod::DELETE) {
            return raderaUppgift($route->getParams()[0]);
        }
    } catch (Exception $exc) {
        return new Response($exc->getMessage(), 400);
    }
}

/**
 * Hämtar alla uppgifter för en angiven sida
 * @param string $sida
 * @return Response
 */
function hamtaSida(string $sida): Response {
    // Kontrollera indata
    $sidnummer=filter_var($sida, FILTER_VALIDATE_INT);

    if($sidnummer === false){
        $retur = new stdClass();
        $retur->error = ["Bad request", "Ogiltigt sidnummer"];

        return new Response($retur, 400);
    } elseif ($sidnummer<1) {
        $retur = new stdClass();
        $retur->error = ["Bad request", "Sidnummer ska vara större än noll"];

        return new Response($retur, 400);
    }
    // Hämta antal poster per sida
    $settings=new Settings();
    $posterPerSida=$settings->recordsPerPage;


    // Koppla databas
$db=connectDb();

    // Skicka fråga om antal poster
    $result=$db->query("SELECT COUNT(*) FROM uppgifter");
    $antalRader=$result->fetchColumn();
    $antalSidor= ceil($antalRader/$posterPerSida);

    // Kontrollera begärd sida
    If($sidnummer>$antalSidor){
        $retur = new stdClass();
        $retur->error=["Bad request", "Det finns bara $antalSidor"];

        return new Response($retur, 400);
    }
    // Skicka fråga för aktuell sida
    $firstRecord = $sidnummer * $posterPerSida - $posterPerSida;
    $result = $db->query ("SELECT uppgifter.id, aktivitet_id, datum, varaktighet,aktivitet, beskrivning 
    FROM uppgifter
    INNER JOIN aktiviteter ON aktiviteter.id=aktivitet_id
    ORDER BY datum LIMIT $firstRecord, $posterPerSida");


    // Returnera svar
    $retur = [];
    foreach ($result->fetchAll() as $row) {
        $post=new stdClass();
        $post->id=$row['id'];
        $post->activityId=$row['aktivitet_id'];
        $post->date=$row['datum'];
        $post->time=$row['varaktighet'];
        $post->activity=$row['aktivitet'];
        $post->description=$row['beskrivning'];
        $retur[]=$post;
    }

    $svar = new stdClass();
    $svar->pages = $antalSidor;
    $svar->tasks = $retur;

    return new Response($svar);
}

/**
 * Hämtar alla poster mellan angivna datum
 * @param string $from
 * @param string $tom
 * @return Response
 */
function hamtaDatum(string $from, string $tom): Response {

    // Kontrollera indata
    $fromDate=DateTimeImmutable::createFromFormat('Y-m-d', $from);
    $tomDate=DateTimeImmutable::createFromFormat('Y-m-d', $tom);

    $err=[];
    if($fromDate===false) {
        $err[]="Ogiltigt från-datum";
    } elseif($fromDate->format('Y-m-d')!==$from) {
        $err[]="Ogiltigt format på från-datum";
    }

    if($tomDate===false) {
        $err[]="Ogiltigt till-datum";
    }  elseif($tomDate->format('Y-m-d')!==$tom) {
        $err[] = "Ogiltigt format på till-datum";
    }
    if(count($err)===0 && $fromDate->format('Y-m-d')>$tomDate->format('Y-m-d')) {
        $err[]="Från-datum ska vara mindre än till-datum";
    }

    if(count($err)>0) {
        array_unshift($err, "Bad request");
        $retur=new stdClass();
        $retur->error=$err;
        return new Response($retur, 400);
    }

    // Koppla databas
    $db=connectDb();

    // Skicka fråga
    $stmt = $db->prepare("SELECT uppgifter.id, aktivitet_id, datum, varaktighet,aktivitet, beskrivning 
FROM uppgifter
INNER JOIN aktiviteter ON aktiviteter.id=aktivitet_id
WHERE datum BETWEEN :from AND :to");
    $stmt->execute(["from" => $fromDate->format("Y-m-d"), "to" => $tomDate->format("Y-m-d")]);


    // Kontrollera svar och returnera data
    $retur = [];
    foreach ($stmt->fetchAll() as $row) {
        $post=new stdClass();
        $post->id=$row['id'];
        $post->activityId=$row['aktivitet_id'];
        $post->date=$row['datum'];
        $post->time=$row['varaktighet'];
        $post->activity=$row['aktivitet'];
        $post->description=$row['beskrivning'];
        $retur[]=$post;
    }

    return new Response($retur);

}


function hamtaEnskildUppgift(string $id): Response {

    // Kontrollera indata
    $taskid=filter_var($id, FILTER_VALIDATE_INT);

    if($taskid === false){
        $retur = new stdClass();
        $retur->error = ["Bad request", "Ogiltigt uppgiftsid"];
        return new Response($retur, 400);
    }

    // koppla databas
    $db=connectDb();

    // Hämta post
    $stmt = $db->prepare("SELECT uppgifter.id, aktivitet_id, datum, varaktighet,aktivitet, beskrivning 
FROM uppgifter
INNER JOIN aktiviteter ON aktiviteter.id=aktivitet_id
WHERE uppgifter.id=:id");
    $stmt->execute(["id" => $taskid]);

    // Returnera svar
    $row=$stmt->fetch();
    if(!$row){
        $retur = new stdClass();
        $retur->error = ["Bad request", "Angiven id ($taskid) finns inte i databasen"];
        return new Response($retur, 400);
    }


    $retur=new stdClass();
    $retur->id=$row['id'];
    $retur->date=$row['datum'];
    $retur->time=substr($row['varaktighet'], 0, 5);
    $retur->activityId=$row['aktivitet_id'];
    $retur->activity=$row['aktivitet'];
    $retur->description=$row['beskrivning'];

    return new Response($retur);
}


/**
 * Sparar en ny uppgiftspost
 * @param array $postData indata för uppgiften
 * @return Response
 */



function sparaNyUppgift(array $postData): Response {

    // Kontrollera indata
    $indataErr=kontrolleraIndata($postData);

    if(count($indataErr)===0) {
        $retur = new stdClass();
        $retur->error = array_merge(["Bad request"], $indataErr);

        return new Response($retur, 400);
    }
    if(!array_key_exists('description', $postData)) {
        $postData['description']="";
    } else {
        $postData['description']=htmlspecialchars($postData['description']);
    }


    unset($postData['action']);

    // Koppla databas
    $db=connectDb();

    // Skicka fråga
    $stmt=$db->prepare('INSERT INTO uppgifter (aktivitet_id, datum, varaktighet, beskrivning)
VALUES (:activityId, :date, :time, :description)');
    $stmt->execute($postData);

    // Returnera svar
    $nyttId=$db->lastInsertId();
    $retur = new stdClass();
    $retur->id=$nyttId;
    $retur->meddelande = ["Spara lyckades"];

    return new Response($retur);

}

/**
 * Uppdaterar en angiven uppgiftspost med ny information 
 * @param string $id id för posten som ska uppdateras
 * @param array $postData ny data att sparas
 * @return Response
 */
function uppdateraUppgift(string $id, array $postData): Response {

    // Kontrollera indata
    $indataErr=kontrolleraIndata($postData);

    if(count($indataErr)===0) {
        $retur = new stdClass();
        $retur->error = array_merge(["Bad request"], $indataErr);

        return new Response($retur, 400);
    }
    if(!array_key_exists('description', $postData)) {
        $postData['description']="";
    } else {
        $postData['description']=htmlspecialchars($postData['description']);
    }


    $taskId = filter_var($id, FILTER_VALIDATE_INT);

    if ($taskId === false) {
        $retur = new stdClass();
        $retur->error = ['Bad request', 'Ogiltigt id'];
        return new Response($retur, 400);
    }

    $postData['id']=$taskId;
    unset($postData['action']);

    // Koppla databas
    $db=connectDb();

    // Skicka fråga
    $stmt=$db->prepare('UPDATE uppgifter SET 
                     datum=:date, varaktighet=:time, aktivitet=:activityId, beskrivning=:description
                     WHERE id=:id');
    $stmt->execute($postData);

    // Kontrollera svar från
    $retur = new stdClass();
    if($stmt->rowCount()==0) {
        $retur->result=false;
        $retur->message= ["Uppdatera misslyckades", "Inga rader uppdaterades"];
    } else {
        $retur->result=true;
        $retur->message = ["Uppdatera lyckades", "{$stmt->rowCount()} rader uppdaterades"];
    }


    return new Response($retur);
}




function raderaUppgift(string $id): Response {

    // kontrollera indata
    $taskId = filter_var($id, FILTER_VALIDATE_INT);

    if ($taskId === false) {
        $retur = new stdClass();
        $retur->error = ['Bad request', 'Ogiltigt id'];
        return new Response($retur, 400);
    }

    // Koppla databas
    $db=connectDb();


        // Skicka fråga
        $stmt=$db->prepare('DELETE FROM uppgifter WHERE id=:id');
        $stmt->execute(['id'=>$taskId]);

        // Kontrollera svar och returnera svar
        if($stmt->rowCount()==0) {
            $retur=new stdClass();
            $retur->result=false;
            $retur->message=['Radera misslyckades', 'Inga poster raderades'];
            return new Response($retur);
        }

        $retur=new stdClass();
        $retur->result=true;
        $retur->message=['Radera lyckades', "{$stmt->rowCount()} poster raderades"];
        return new Response($retur);
    }




function kontrolleraIndata(array $postData):array {
    $returArray=[];
    // Indatakontroller för datum ($postData["date"])
    if(array_key_exists("date", $postData)){
        $datum=DateTimeImmutable::createFromFormat('Y-m-d', $postData['date']);
        if($datum===false){
            $returArray[]="Ogiltigt datum";
        } elseif($datum->format('Y-m-d')!==$postData['date']) {
            $returArray[]="Ogiltigt datum-format";
        } elseif($datum->format('Y-m-d')>date('date')) {
            $returArray[]="Datum får inte vara i framtiden";
        }
    } else {
        $returArray[]="Datum ('date') saknas";
    }

    // Indatakontroller för varaktighet ($postData["time"])
    if(array_key_exists("time", $postData)){
        $varaktighet=DateTimeImmutable::createFromFormat('H:m', $postData['time']);
        if($varaktighet===false){
            $returArray[]="Ogiltigt varaktighet";
        } elseif ($varaktighet->format('H:i')!==$postData['time']) {
            $returArray[] = "Ogiltigt tidsangivelse för varaktighet";
        } elseif ($postData["time"]>"08:00"||$postData["time"]<"00:15") {
            $returArray[]="Varaktigheten ska vara mindre än 8 timmar";
        } elseif(in_array(substr($postData["time"], -2), ["00", "15", "30", "45"])) {
            $returArray[] = "Ange varaktigheten i jämna 15 minuter";
        }
    } else {
        $returArray[]="Varaktighet ('time') saknas";
    }


    // Indatakontroll för aktivitetstid ($postData["activityId"])
    if(in_array("activityId", $postData)){
        $activityId=filter_var($postData['activityId'], FILTER_VALIDATE_INT);
        if($activityId===false){
            $returArray[]="Ogiltigt aktivitetsid";
        } elseif($activityId<1){
            $returArray[]="Aktivitetsid ('activityId') ska vara större än noll";
        }
    } else {
       $returArray[]="Aktivitet ('activityId') saknas";
    }

    return $returArray;
}
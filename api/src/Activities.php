<?php

declare (strict_types=1);
require_once __DIR__ . '/funktioner.php';

/**
 * Läs av rutt-information och anropa funktion baserat på angiven rutt
 * @param Route $route Rutt-information
 * @param array $postData Indata för behandling i angiven rutt
 * @return Response
 */
function activities(Route $route, array $postData): Response {

    try {
        if (count($route->getParams()) === 0 && $route->getMethod() === RequestMethod::GET) {
            return hamtaAllaAktiviteter();
        }
        if (count($route->getParams()) === 1 && $route->getMethod() === RequestMethod::GET) {
            return hamtaEnskildAktivitet($route->getParams()[0]);
        }
        if (isset($postData["activity"]) && count($route->getParams()) === 0 &&
                $route->getMethod() === RequestMethod::POST) {
            return sparaNyAktivitet((string) $postData["activity"]);
        }
        if (count($route->getParams()) === 1 && $route->getMethod() === RequestMethod::PUT) {
            return uppdateraAktivitet( $route->getParams()[0],  $postData["activity"]);
        }
        if (count($route->getParams()) === 1 && $route->getMethod() === RequestMethod::DELETE) {
            return raderaAktivetet($route->getParams()[0]);
        }
    } catch (Exception $exc) {
        return new Response($exc->getMessage(), 400);
    }

    return new Response("Okänt anrop", 400);
}

/**
 * Returnerar alla aktiviteter som finns i databasen
 * @return Response
 */
function hamtaAllaAktiviteter(): Response {
    // koppla mot databas
    $db=connectDb();

    // Hämta alla aktiviteter
    $result=$db->query("SELECT id, aktivitet FROM aktiviteter");

    // Skapa retur
    $retur=[];
    foreach ($result as $post) {
        $rad=new stdClass();
        $rad->id=$post["id"];
        $rad->activity=$post["aktivitet"];
        $retur[]=$rad;
    }

    // Returnera svar
    return new Response(["activities"=>$retur]);

}


/**
 * Returnerar en enskild aktivitet som finns i databasen
 * @param string $id Id för aktiviteten
 * @return Response
 */
function hamtaEnskildAktivitet(string $id): Response {

    // Kontrollera indata
    $aktivitetsId=filter_var($id, FILTER_VALIDATE_INT);

    if($aktivitetsId===false) {
        $retur=new stdClass();
        $retur->error=["Bad request", "Ogiltigt id"];
        return new Response($retur, 400);
    }
    // Koppla mot databas
    $db = connectDb();

    // Skicka fråga
    $stmt = $db->prepare("SELECT id, aktivitet FROM aktiviteter where id=:id");
    $stmt->execute(["id"=>$aktivitetsId]);

    // Hantera svar
    if($row = $stmt->fetch()) {
        $retur = new stdClass();
        $retur->id = $row["id"];
        $retur->activity = $row["aktivitet"];

        return new Response($retur);

    } else {
        $retur = new stdClass();
        $retur->error = ["Bad request", "Angivet id ($aktivitetsId) fanns inte i databasen"];

        return new Response($retur, 400);
    }
}

/**
 * Lagrar en ny aktivitet i databasen
 * @param string $aktivitet Aktivitet som ska sparas
 * @return Response
 */
function sparaNyAktivitet(string $aktivitet): Response
{


// Sanera indata
    $saneradAktivitet = htmlentities($aktivitet);

    // Koppla mot databas
    $db = connectDb();

    // Skicka fråga
    $stmt = $db->prepare("INSERT INTO aktiviteter (aktivitet) VALUES (:aktivitet)");
    $svar = $stmt->execute(["aktivitet" => $saneradAktivitet]);

    // Kontrollera resultat och returnera svar
    if ($svar === true) {
        $retur = new stdClass();
        $retur->id = $db->lastInsertId();
        $retur->meddelande = ["Spara lyckades", "1 post lads till"];
        return new Response($retur);
    } else {
        $retur = new stdClass();
        $retur->error = ["Bad request", "Något gik fel vid spara", $stmt->errorInfo()];
        return new Response($retur, 400);
    }
}

function uppdateraAktivitet(string $id, string $aktivitet):Response
{


    // Kontrollera indata
    $kontrolleratID = filter_var($id, FILTER_VALIDATE_INT);
    $saneradAktivitet = htmlentities($aktivitet);

    if ($kontrolleratID === false) {
        $retur = new stdClass();
        $retur->error = ["Bad request", "Ogiltigt id"];
        return new Response($retur, 400);
    }

    // Koppla databas
    $db = connectDb();

    // Skicka uppdatering
    $stmt = $db->prepare("UPDATE aktiviteter SET aktivitet=:aktivitet WHERE id=:id");
    $stmt->execute(["aktivitet" => $saneradAktivitet, "id" => $kontrolleratID]);

    // Kontrollera resultat och skicka svar
    if ($stmt->rowCount() === 1) {
        $retur = new stdClass();
        $retur->result = true;
        $retur->meddelande = ["Uppdatera lyckades", "1 rad uppdaterades"];
        return new Response($retur);
    } elseif ($stmt->rowCount() === 0) {
        $retur = new stdClass();
        $retur->result = false;
        $retur->meddelande = ["Uppdatera misslyckades", "Inga rader uppdaterades"];
        return new Response($retur);
    } else {
        // Hit borde vi aldirg komma!
        $retur = new stdClass();
        $retur->result = true;
        $retur->meddelande = ["Hoppsan", "Uppdatera lyckades", $stmt->rowCount() . " rader uppdaterades!"];
        return new Response($retur);
    }
}



/**
 * Raderar en aktivitet med angivet id
 * @param string $id Id för posten som ska raderas
 * @return Response
 */
function raderaAktivetet(string $id): Response{}

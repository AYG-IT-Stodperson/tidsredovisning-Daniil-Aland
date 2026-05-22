<?php

declare(strict_types=1);
require_once __DIR__ . '/../src/tasks.php';

function allaTaskTester(): string {
    $retur = "<h1>Testar alla uppgiftsfunktioner</h1>";
    $retur .= test_HamtaEnUppgift();
    $retur .= test_HamtaUppgifterSida();
    $retur .= test_RaderaUppgift();
    $retur .= test_SparaUppgift();
    $retur .= test_UppdateraUppgifter();
    return $retur;
}

function test_HamtaUppgifterSida(): string {
    $retur = "<h2>test_HamtaUppgifterSida</h2>";
    try {
        $retur .= "<p class='error'>Inga tester implementerade</p>";
    } catch (Exception $ex) {
        $retur .= "<p class='error'>Något gick fel, meddelandet säger:<br> {$ex->getMessage()}</p>";
    }
    return $retur;
}

function test_HamtaAllaUppgifterDatum(): string {
    $retur = "<h2>test_HamtaAllaUppgifterDatum</h2>";
    try {
        $retur .= "<p class='error'>Inga tester implementerade</p>";
    } catch (Exception $ex) {
        $retur .= "<p class='error'>Något gick fel, meddelandet säger:<br> {$ex->getMessage()}</p>";
    }
    return $retur;
}

// KOPIERAD FRÅN FACIT - har riktiga tester
function test_HamtaEnUppgift(): string {
    $retur = "<h2>test_HamtaEnUppgift</h2>";
    try {
        // Testa -1
        $svar = hamtaEnskildUppgift("-1");
        if ($svar->getStatus() === 400) {
            $retur .= "<p class='ok'>Hämta uppgift med id=-1 returnerade 400, som förväntat</p>";
        } else {
            $retur .= "<p class='error'>Hämta uppgift med id=-1 returnerade {$svar->getStatus()}, 400 förväntades</p>";
        }

        // Testa 'sju'
        $svar = hamtaEnskildUppgift("sju");
        if ($svar->getStatus() === 400) {
            $retur .= "<p class='ok'>Hämta uppgift med id='sju' returnerade 400, som förväntat</p>";
        } else {
            $retur .= "<p class='error'>Hämta uppgift med id='sju' returnerade {$svar->getStatus()}, 400 förväntades</p>";
        }

        // Hämta sista postens id
        $db = connectDb();
        $sistaPost = $db->query('SELECT MAX(id) FROM uppgifter')->fetchColumn();

        // Testa uppgift som inte finns
        $svar = hamtaEnskildUppgift((string)($sistaPost + 1));
        if ($svar->getStatus() === 400) {
            $retur .= "<p class='ok'>Hämta uppgift med id som inte finns (" . $sistaPost + 1 . ") returnerade 400, som förväntat</p>";
        } else {
            $retur .= "<p class='error'>Hämta uppgift med id som inte finns (" . $sistaPost + 1 . ") returnerade {$svar->getStatus()}, 400 förväntades</p>";
        }

        // Testa uppgift som finns
        $svar = hamtaEnskildUppgift((string)($sistaPost));
        if ($svar->getStatus() === 200) {
            $retur .= "<p class='ok'>Hämta uppgift med id som finns (" . $sistaPost . ") returnerade 200, som förväntat</p>";
        } else {
            $retur .= "<p class='error'>Hämta uppgift med id som finns (" . $sistaPost . ") returnerade {$svar->getStatus()}, 200 förväntades</p>";
        }
    } catch (Exception $ex) {
        $retur .= "<p class='error'>Något gick fel, meddelandet säger:<br> {$ex->getMessage()}</p>";
    }
    return $retur;
}

// KOPIERAD FRÅN FACIT - har riktiga tester
function test_SparaUppgift(): string {
    $retur = "<h2>test_SparaUppgift</h2>";
    $db = connectDb();
    try {
        $db->beginTransaction();

        $postData = [
            'date' => '2020-05-35', // Felaktigt datum
            'time' => '01:00',
            'activityId' => -1,     // Felaktigt activityId
            'description' => "Test"
        ];

        // Test där verifieringen misslyckas -> 400
        $svar = sparaNyUppgift($postData);
        if ($svar->getStatus() === 400) {
            $retur .= "<p class='ok'>Spara post med felaktig indata returnerade 400, som förväntat</p>";
        } else {
            $retur .= "<p class='error'>Spara post med felaktig indata returnerade {$svar->getStatus()}, 400 förväntades</p>";
        }

        // Test med felaktigt aktivitetsId -> 400
        $aktivitetsId = $db->query('SELECT MAX(id) FROM aktiviteter')->fetchColumn();
        $postData['date'] = date('Y-m-d', strtotime('yesterday'));
        $postData['activityId'] = $aktivitetsId + 1;
        $svar = sparaNyUppgift($postData);
        if ($svar->getStatus() === 400) {
            $retur .= "<p class='ok'>Spara post med felaktigt aktivitetId returnerade 400, som förväntat</p>";
        } else {
            $retur .= "<p class='error'>Spara post med felaktigt aktivitetId returnerade {$svar->getStatus()}, 400 förväntades</p>";
        }

        // Test utan description -> 200
        $postData['activityId'] = $aktivitetsId;
        unset($postData['description']);
        $svar = sparaNyUppgift($postData);
        if ($svar->getStatus() === 200) {
            $retur .= "<p class='ok'>Spara post utan description returnerade 200, som förväntat</p>";
        } else {
            $retur .= "<p class='error'>Spara post utan description returnerade {$svar->getStatus()}, 200 förväntades</p>";
        }

        // Test med description -> 200
        $postData['description'] = "Test";
        $svar = sparaNyUppgift($postData);
        if ($svar->getStatus() === 200) {
            $retur .= "<p class='ok'>Spara post med description returnerade 200, som förväntat</p>";
        } else {
            $retur .= "<p class='error'>Spara post med description returnerade {$svar->getStatus()}, 200 förväntades</p>";
        }
    } catch (Exception $ex) {
        $retur .= "<p class='error'>Något gick fel, meddelandet säger:<br> {$ex->getMessage()}</p>";
    } finally {
        $db->rollBack();
    }
    return $retur;
}

// KOPIERAD FRÅN FACIT - har riktiga tester
function test_UppdateraUppgifter(): string {
    $retur = "<h2>test_UppdateraUppgifter</h2>";
    $db = connectDb();
    try {
        $db->beginTransaction();

        $aktivitet_id = $db->query('SELECT MAX(id) FROM aktiviteter')->fetchColumn();
        $postData = [
            'date'=>date('Y-m-d', strtotime('yesterday')),
            'time' => '01:00',
            'activityId' => $aktivitet_id,
            'description' => 'test'
        ];

        $svar=sparaNyUppgift($postData);

        $id = $svar->getContent()->id;


        // Test med felaktig indata (datum=i morgon) -> 400
        $postData['date'] = date('Y-m-d', strtotime('tomorrow'));


        $svar = uppdateraUppgift($id, $postData);


        if ($svar->getStatus() === 400) {
            $retur .= "<p class='ok'>Uppdatera post med felaktig indata (datum=i morgon) returnerade 400, som förväntat</p>";
        } else {
            $retur .= "<p class='error'>Uppdatera post med felaktig indata (datum=i morgon) returnerade {$svar->getStatus()}, 400 förväntades</p>";
        }

        // Test med ogiltigt aktivitetsid -> 400
        $postData['date'] = date('Y-m-d', strtotime('yesterday'));
        $postData['activityId'] = $aktivitet_id + 1;
        $svar = uppdateraUppgift($id, $postData);
        if ($svar->getStatus() === 400) {
            $retur .= "<p class='ok'>Uppdatera post med felaktigt aktivitetsId returnerade 400, som förväntat</p>";
        } else {
            $retur .= "<p class='error'>Uppdatera post med felaktigt aktivitetsId returnerade {$svar->getStatus()}, 400 förväntades</p>";
        }

        // Test med felaktigt id (-1) -> 400
        $postData['activityId'] = $aktivitet_id;
        $svar = uppdateraUppgift('-1', $postData);
        if ($svar->getStatus() === 400) {
            $retur .= "<p class='ok'>Uppdatera post med felaktigt id (-1) returnerade 400, som förväntat</p>";
        } else {
            $retur .= "<p class='error'>Uppdatera post med felaktigt id (-1) returnerade {$svar->getStatus()}, 400 förväntades</p>";
        }

        // Test med felaktigt id ('sju') -> 400
        $svar = uppdateraUppgift('sju', $postData);
        if ($svar->getStatus() === 400) {
            $retur .= "<p class='ok'>Uppdatera post med felaktigt id (sju) returnerade 400, som förväntat</p>";
        } else {
            $retur .= "<p class='error'>Uppdatera post med felaktigt id (sju) returnerade {$svar->getStatus()}, 400 förväntades</p>";
        }

        // Test utan description -> 200

        unset($postData['description']);
        $svar = uppdateraUppgift($id, $postData);

        if ($svar->getStatus() === 200) {

            if ($svar->getContent()->result) {

                $retur .= "<p class='ok'>Uppdatera post utan beskrivning returnerade 200, som förväntat</p>";
            } else {
                $retur .= "<p class='error'>Uppdatera post utan beskrivning returnerade 200 förväntat
men result=false, true förväntades</p>";
            }
        } else {
            $retur .= "<p class='error'>Uppdatera post utan beskrivning returnerade {$svar->getStatus()}, 200 förväntades</p>";
        }


        // Test med description -> 200
        $postData['description'] = "Ny beskrivning";
        $svar=uppdateraUppgift($id, $postData);
        if ($svar->getStatus() === 200) {
            if($svar->getContent()->result) {
                $retur .= "<p class='ok'>Uppdatera post med beskrivning returnerade 200, som förväntat</p>";
            } else {
                $retur .= "<p class='error'>Uppdatera post med beskrivning returnerade 200 som förväntat men result=true, false förväntades</p>";
            }
        } else {
            $retur .= "<p class='error'>Uppdatera post som inte ändrats returnerade {$svar->getStatus()}, 200 förväntades</p>";
        }





        // Test utan några ändringar -> 200 och result=false

        $svar=uppdateraUppgift($id, $postData);
        if ($svar->getStatus() == 200) {
            if($svar->getContent()->result===false) {
                $retur .= "<p class='ok'>Uppdatera post som inte ändrats returnerade 200, som förväntat</p>";
            } else {
                $retur .= "<p class='error'>Uppdatera post som inte ändrats returnerade 200 som förväntat men result=true, false förväntades</p>";
            }
        } else {
            $retur .= "<p class='error'>Uppdatera post som inte ändrats returnerade {$svar->getStatus()}, 200 förväntades</p>";
        }

    }catch (Exception $ex) {
        $retur .= "<p class='error'>Något gick fel, meddelandet säger:<br> {$ex->getMessage()}</p>";
    } finally {
        $db->rollBack();
    }
    return $retur;
}

function test_KontrolleraIndata(): string {
    $retur = "<h2>test_KontrolleraIndata</h2>";
    try {
        $retur .= "<p class='error'>Inga tester implementerade</p>";
    } catch (Exception $ex) {
        $retur .= "<p class='error'>Något gick fel, meddelandet säger:<br> {$ex->getMessage()}</p>";
    }
    return $retur;
}

function test_RaderaUppgift(): string {
    $retur = "<h2>test_RaderaUppgift</h2>";

$db=connectDb();
    try {
        $db->beginTransaction();
        // Test med felaktigt id (-1)
        $svar = raderaUppgift('-1');
        if ($svar->getStatus() === 400) {
            $retur .= "<p class='ok'>Rader post med felaktigt Id returnerade 400, som förväntat</p>";
        } else {
            $retur .= "<p class='error'>Radera post med felaktigt Id returnerade {$svar->getStatus()}, 400 förväntdes</p>";

        }
        // Test med felaktigt id (sju)
        $svar = raderaUppgift('sju');
        if ($svar->getStatus() === 400) {
            $retur .= "<p class='ok'>Rader post med felaktigt Id returnerade 400, som förväntat</p>";
        } else {
            $retur .= "<p class='error'>Radera post med felaktigt Id returnerade {$svar->getStatus()}, 400 förväntdes</p>";
        }

        // Hitta ett befintligt aktivitetsid
        $aktivitet_id = $db->query('SELECT MAX(id) FROM aktiviteter')->fetchColumn();
        // Skapa en ny uppgift som kan raderas
        $postData = [
            'date'=>date('Y-m-d', strtotime('yesterday')),
            'time' => '01:00',
            'activityId' => $aktivitet_id,
            'description' => 'test'
        ];

        $svar=sparaNyUppgift($postData);
        $id = $svar->getContent()->id;

        // Test med id som finns -> 200 & result=true
        $svar=raderaUppgift($id);
        if ($svar->getStatus() == 200) {
            if($svar->getContent()->result===true) {
                $retur .= "<p class='ok'>Radera post som returnerade 200, som förväntat</p>";
            } else {
                $retur .= "<p class='error'>Radera post returnerade 200 som förväntat men result=false, true förväntades</p>";
            }
        } else {
            $retur .= "<p class='error'>Radera post returnerade {$svar->getStatus()}, 200 förväntades</p>";
        }


        // Test med id som inte finns -> 200 & result=false

        $svar=raderaUppgift($id);
        if ($svar->getStatus() == 200) {
            if($svar->getContent()->result===false) {
                $retur .= "<p class='ok'>Radera post som returnerade 200, som förväntat</p>";
            } else {
                $retur .= "<p class='error'>Radera post returnerade 200 som förväntat men result=true, false förväntades</p>";
            }
        } else {
            $retur .= "<p class='error'>Radera post returnerade {$svar->getStatus()}, 200 förväntades</p>";
        }


    } catch (Exception $ex) {
        $retur .= "<p class='error'>Något gick fel, meddelandet säger:<br> {$ex->getMessage()}</p>";
    }
    finally {$db->rollBack();}
    return $retur;
}
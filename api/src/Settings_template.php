<?php
declare(strict_types=1);

/**
 * Inställningar för api:et
 * 
 */
class Settings {

    public string  $dsn = "";
    public string  $dbUser = "";
    public string  $dbPassword = "";
    public int $recordsPerPage=5;
}
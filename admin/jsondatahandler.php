<?php
    //pull in all data, format, etc
    $str_json = file_get_contents('php://input');
    $data = json_decode($str_json);
    $filename = $data->fileName;
    $year = $data->year;
    $data_string = json_encode($data->data);

    if (!file_exists("./siteData/$year")) {
        mkdir("./siteData/$year", 0777, true);
    }

    $data_file = fopen("./siteData/$year/$filename.json", "w") or die("Unable to open file!");
    fwrite($data_file, $data_string);
    fclose($data_file);
?>

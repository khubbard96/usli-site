<?php
//processes all files, photos, documents, etc
//does not process website json data
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['files'])) {
        $errors = [];
        $year = $_POST['year'][0];
        $path = "./images/$year/";
        $extensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];

        $all_files = count($_FILES['files']['tmp_name']);


        for ($i = 0; $i < $all_files; $i++) {
            $file_name = $_FILES['files']['name'][$i];
            $file_tmp = $_FILES['files']['tmp_name'][$i];
            $file_type = $_FILES['files']['type'][$i];
            $file_size = $_FILES['files']['size'][$i];
            $file_ext = strtolower(end(explode('.', $_FILES['files']['name'][$i])));

            $file = $path . $file_name;

            if (!in_array($file_ext, $extensions)) {
                $errors[] = 'Extension not allowed: ' . $file_name . ' ' . $file_type;
            }

            if ($file_size > 2097152) {
                $errors[] = 'File size exceeds limit: ' . $file_name . ' ' . $file_type;
            }
            var_dump($_POST);
            if (empty($errors)) {

                if (!file_exists($path)) {
                   mkdir($path, 0777, true);
                }

                move_uploaded_file($file_tmp, $file);
            }
        }

        if ($errors) print_r($errors);
    }
}

?>
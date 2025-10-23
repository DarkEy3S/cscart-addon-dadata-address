<?php

use Tygh\Registry;

if (!defined('BOOTSTRAP')) { die('Access denied'); }

if ($mode == 'suggest') {
    $token = Registry::get('addons.dadata_address.dadata_token');
    $url = Registry::get('addons.dadata_address.dadata_url') ?: 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address';
    $query = $_REQUEST['query'] ?? '';
    
    if (!$token || !$query) {
        header('Content-Type: application/json');
        echo json_encode(['suggestions' => []]);
        exit;
    }
    
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode(['query' => $query]),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Token ' . $token
        ],
        CURLOPT_TIMEOUT => 10,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false
    ]);
    
    $response = curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        header('Content-Type: application/json');
        echo json_encode(['suggestions' => []]);
        exit;
    }
    
    header('Content-Type: application/json');
    echo $response;
    exit;
}


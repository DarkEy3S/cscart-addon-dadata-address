<?php

if (!defined('BOOTSTRAP')) { die('Access denied'); }

$schema['dadata_address'] = [
    'templates' => [
        'addons/dadata_address/blocks/dadata_block.tpl' => [],
    ],
    'wrappers' => 'blocks/wrappers',
];

return $schema;


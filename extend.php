<?php
namespace Flagrow\UsersList;

use Flarum\Extend;

return [
    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js')
        ->css(__DIR__ . '/resources/less/admin.less'),
    new Extend\Locales(__DIR__ . '/resources/locale'),
    (new Extend\Routes('api'))
        ->post('/admin-mail', 'flagrow.users-list.create-mail', Api\Controller\SendAdminEmailController::class),
];

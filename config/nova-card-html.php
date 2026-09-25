<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | HTML sanitizing
    |--------------------------------------------------------------------------
    |
    | Card content is authored in PHP by your application, so it is trusted by
    | default and passed to the browser untouched. Set this to true to sanitize
    | every card globally, or call ->sanitize() on the cards that render any
    | user supplied content.
    |
    */

    'sanitize' => false,

    'sanitizer' => [
        // 'auto' uses mews/purifier when installed, otherwise the built-in
        // allow list. Force one with 'purifier' or 'allow-list'.
        'driver' => 'auto',

        'purifier_config' => null,

        // Empty arrays fall back to AllowListSanitizer's defaults.
        'allowed_tags' => [],
        'allowed_attributes' => [],
    ],

    /*
    |--------------------------------------------------------------------------
    | Caching
    |--------------------------------------------------------------------------
    |
    | Applies to cards that opt in with ->cache(). A null store means the
    | application's default cache store.
    |
    */

    'cache' => [
        'store' => null,
        'prefix' => 'nova-card-html',
    ],

    /*
    |--------------------------------------------------------------------------
    | Lazy loading
    |--------------------------------------------------------------------------
    |
    | The route used by cards that opt in with ->lazy(). It is always registered
    | inside Nova's middleware group.
    |
    */

    'lazy' => [
        'enabled' => true,
        'path' => 'nova-vendor/nova-card-html',
    ],

    /*
    |--------------------------------------------------------------------------
    | Defaults
    |--------------------------------------------------------------------------
    */

    'defaults' => [
        'width' => '1/3',
        'height' => 'dynamic',
        'align' => 'left',
    ],

];

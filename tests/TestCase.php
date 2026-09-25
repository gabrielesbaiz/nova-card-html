<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Tests;

use Gabrielesbaiz\NovaCardHtml\NovaCardHtmlServiceProvider;
use Illuminate\Contracts\Config\Repository;
use Inertia\ServiceProvider as InertiaServiceProvider;
use Laravel\Nova\NovaCoreServiceProvider;
use Orchestra\Testbench\TestCase as Orchestra;

class TestCase extends Orchestra
{
    protected function getPackageProviders($app)
    {
        return [
            // Nova's middleware group runs Inertia middleware, which needs its
            // own provider registered before any route in the group resolves.
            InertiaServiceProvider::class,
            NovaCoreServiceProvider::class,
            NovaCardHtmlServiceProvider::class,
        ];
    }

    protected function defineEnvironment($app)
    {
        tap($app->make(Repository::class), function (Repository $config): void {
            // Lazy card tokens are encrypted, so the suite needs a real key.
            $config->set('app.key', 'base64:'.base64_encode(random_bytes(32)));
            $config->set('database.default', 'testing');
            $config->set('cache.default', 'array');
        });
    }
}

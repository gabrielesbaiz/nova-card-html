<?php

namespace Gabrielesbaiz\NovaCardHtml\Tests;

use Orchestra\Testbench\TestCase as Orchestra;
use Illuminate\Database\Eloquent\Factories\Factory;
use Gabrielesbaiz\NovaCardHtml\NovaCardHtmlServiceProvider;

class TestCase extends Orchestra
{
    public function getEnvironmentSetUp($app)
    {
        config()->set('database.default', 'testing');

        /*
         foreach (\Illuminate\Support\Facades\File::allFiles(__DIR__ . '/database/migrations') as $migration) {
            (include $migration->getRealPath())->up();
         }
         */
    }

    protected function setUp(): void
    {
        parent::setUp();

        Factory::guessFactoryNamesUsing(
            fn (string $modelName) => 'Gabrielesbaiz\\NovaCardHtml\\Database\\Factories\\' . class_basename($modelName) . 'Factory'
        );
    }

    protected function getPackageProviders($app)
    {
        return [
            NovaCardHtmlServiceProvider::class,
        ];
    }
}

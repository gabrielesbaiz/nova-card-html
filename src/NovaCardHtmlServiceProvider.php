<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml;

use Gabrielesbaiz\NovaCardHtml\Console\NovaCardCommand;
use Gabrielesbaiz\NovaCardHtml\Console\UpgradeCommand;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Laravel\Nova\Nova;

class NovaCardHtmlServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/nova-card-html.php', 'nova-card-html');
    }

    public function boot(): void
    {
        $this->registerAssets();
        $this->registerRoutes();
        $this->registerPublishing();

        if ($this->app->runningInConsole()) {
            $this->commands([
                NovaCardCommand::class,
                UpgradeCommand::class,
            ]);
        }
    }

    protected function registerAssets(): void
    {
        Nova::serving(function (): void {
            Nova::script('nova-card-html', __DIR__.'/../dist/js/card.js');
            Nova::style('nova-card-html', __DIR__.'/../dist/css/card.css');

            // Nova's JS __() reads translations registered here, not the PHP
            // translator, so the card's own strings need their own JSON file.
            $locale = __DIR__.'/../lang/'.app()->getLocale().'.json';

            Nova::translations(is_file($locale) ? $locale : __DIR__.'/../lang/en.json');
        });
    }

    protected function registerRoutes(): void
    {
        if (config('nova-card-html.lazy.enabled') !== true) {
            return;
        }

        /** @var string $path */
        $path = config('nova-card-html.lazy.path', 'nova-vendor/nova-card-html');

        // Nova's middleware group carries authentication and the viewNova gate,
        // so the lazy endpoint is never reachable by an unauthenticated visitor.
        Route::middleware(['nova'])
            ->prefix($path)
            ->name('nova-card-html.')
            ->group(__DIR__.'/../routes/api.php');
    }

    protected function registerPublishing(): void
    {
        if (! $this->app->runningInConsole()) {
            return;
        }

        $this->publishes([
            __DIR__.'/../config/nova-card-html.php' => config_path('nova-card-html.php'),
        ], 'nova-card-html-config');

        $this->publishes([
            __DIR__.'/../lang' => lang_path('vendor/nova-card-html'),
        ], 'nova-card-html-lang');
    }
}

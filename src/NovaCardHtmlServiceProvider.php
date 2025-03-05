<?php

namespace Gabrielesbaiz\NovaCardHtml;

use Laravel\Nova\Nova;
use Laravel\Nova\Events\ServingNova;
use Illuminate\Support\ServiceProvider;
use Gabrielesbaiz\NovaCardHtml\Console\CardCommand;

class NovaCardHtmlServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Nova::serving(function (ServingNova $event) {
            Nova::script('nova-card-html', __DIR__ . '/../dist/js/card.js');
            Nova::style('nova-card-html', __DIR__ . '/../dist/css/card.css');
        });

        if ($this->app->runningInConsole()) {
            $this->commands([CardCommand::class]);
        }
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
    }
}

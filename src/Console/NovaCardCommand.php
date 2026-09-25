<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Console;

use Illuminate\Console\GeneratorCommand;
use Laravel\Nova\Nova;

class NovaCardCommand extends GeneratorCommand
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nova-card-html {name}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new html card';

    protected function buildClass($name)
    {
        $stub = parent::buildClass($name);

        /** @var string $name */
        $name = $this->argument('name');

        return str_replace('card-title', Nova::humanize($name), $stub);
    }

    /**
     * Get the stub file for the generator.
     */
    protected function getStub(): string
    {
        return __DIR__.'/NovaCard.stub';
    }

    /**
     * Get the default namespace for the class.
     *
     * @param  string  $rootNamespace
     */
    protected function getDefaultNamespace($rootNamespace): string
    {
        return $rootNamespace.'\Nova\Cards';
    }
}

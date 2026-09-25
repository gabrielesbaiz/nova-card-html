<?php

declare(strict_types=1);

arch('it will not use debugging functions')
    ->expect(['dd', 'dump', 'ray', 'var_dump'])
    ->each->not->toBeUsed();

arch('source files declare strict types')
    ->expect('Gabrielesbaiz\NovaCardHtml')
    ->toUseStrictTypes();

arch('concerns are traits')
    ->expect('Gabrielesbaiz\NovaCardHtml\Concerns')
    ->toBeTraits();

arch('contracts are interfaces')
    ->expect('Gabrielesbaiz\NovaCardHtml\Contracts')
    ->toBeInterfaces();

arch('sanitizers implement the contract')
    ->expect('Gabrielesbaiz\NovaCardHtml\Support\AllowListSanitizer')
    ->toImplement('Gabrielesbaiz\NovaCardHtml\Contracts\HtmlSanitizer');

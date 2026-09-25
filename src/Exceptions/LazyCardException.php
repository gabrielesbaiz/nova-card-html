<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Exceptions;

use RuntimeException;

final class LazyCardException extends RuntimeException
{
    public static function requiresConstructorArguments(string $card): self
    {
        return new self(
            "[{$card}] cannot be lazy: a lazily loaded card is rebuilt in a separate "
            .'request and must therefore be constructible with no arguments. Move the '
            .'required constructor arguments onto #[LazyState] properties, or render '
            .'this card eagerly.',
        );
    }

    public static function unknownCard(): self
    {
        return new self('The lazy card token does not resolve to a NovaCardHtml card.');
    }

    public static function invalidToken(): self
    {
        return new self('The lazy card token is missing, malformed or has been tampered with.');
    }
}

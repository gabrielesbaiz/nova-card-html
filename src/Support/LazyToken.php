<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Support;

use Gabrielesbaiz\NovaCardHtml\Exceptions\LazyCardException;
use Gabrielesbaiz\NovaCardHtml\NovaCardHtml;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;

/**
 * Round-trips the identity and state of a lazily loaded card.
 *
 * The payload is encrypted rather than merely signed so that application class
 * names are not disclosed to the browser. Decryption proves the payload came
 * from this application, but authorisation is still re-checked server side by
 * the controller: a valid token is never treated as permission.
 */
class LazyToken
{
    /**
     * @param  array<string, mixed>  $state
     */
    public static function encode(string $card, array $state): string
    {
        return Crypt::encrypt([
            'card' => $card,
            'state' => $state,
        ]);
    }

    /**
     * @return array{card: class-string<NovaCardHtml>, state: array<string, mixed>}
     */
    public static function decode(string $token): array
    {
        try {
            /** @var mixed $payload */
            $payload = Crypt::decrypt($token);
        } catch (DecryptException) {
            throw LazyCardException::invalidToken();
        }

        if (! is_array($payload) || ! isset($payload['card']) || ! is_string($payload['card'])) {
            throw LazyCardException::invalidToken();
        }

        $card = $payload['card'];

        // Decryption alone does not make instantiation safe: restrict the token
        // to classes that really are cards from this package.
        if (! class_exists($card) || ! is_subclass_of($card, NovaCardHtml::class)) {
            throw LazyCardException::unknownCard();
        }

        /** @var array<string, mixed> $state */
        $state = is_array($payload['state'] ?? null) ? $payload['state'] : [];

        /** @var array{card: class-string<NovaCardHtml>, state: array<string, mixed>} */
        return ['card' => $card, 'state' => $state];
    }
}

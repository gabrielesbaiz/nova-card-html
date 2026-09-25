<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Attributes;

use Attribute;

/**
 * Marks a property whose value must survive a lazy content round trip.
 *
 * A lazily loaded card is rebuilt from scratch inside a separate request, so
 * fluent state set on the dashboard (a selected year, a domain, a filter)
 * would otherwise be lost. Attributed properties are captured into the
 * encrypted lazy token and restored before content() is called.
 */
#[Attribute(Attribute::TARGET_PROPERTY)]
final class LazyState {}

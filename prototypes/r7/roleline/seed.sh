#!/bin/sh
# Rebuild seed/ (gitignored): these options were made against the site at d25c937.
exec "$(dirname "$0")/../build-seed.sh" "$(dirname "$0")" d25c937

#!/bin/sh
cargo build-bpf --bpf-out-dir=../dist

seedfile() {
   mkdir -p "$1"
}

seedfile ../../../../wavedata-api/contract/ink_contracts/;
cp -r -f ../dist/ ../../../../wavedata-api/contract/ink_contracts/;

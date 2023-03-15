#!/bin/sh
cargo build-bpf --bpf-out-dir=../dist

seedfile() {
   mkdir -p "$1"
}

seedfile ../../../../datax-api/contract/ink_contracts/;
cp -r -f ../dist/ ../../../../datax-api/contract/ink_contracts/;

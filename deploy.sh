#!/bin/bash

source local.env

function usage() {
  echo "Usage: $0 [--build,--install,--uninstall,--update,--env]"
}

function build() {
  rm -rf node_modules
  rm twilio.zip
  npm install
  zip -r twilio node_modules package.json twilio.js
}

function install() {
  echo "Adding action"
  wsk package create public
  wsk action create public/twilio --kind nodejs:6 twilio.zip\
    -p IOT_ORG "$IOT_ORG"\
    -p IOT_API_KEY "$IOT_API_KEY"\
    -p IOT_API_TOKEN "$IOT_API_TOKEN"\
    -a final true\
    -a web-export true
}

function update() {
  echo "Updating action"
  wsk action update public/twilio --kind nodejs:6 twilio.zip\
    -p IOT_ORG "$IOT_ORG"\
    -p IOT_API_KEY "$IOT_API_KEY"\
    -p IOT_API_TOKEN "$IOT_API_TOKEN"\
    -a final true\
    -a web-export true
}

function uninstall() {
  echo "Removing actions..."
  wsk action delete public/twilio

  echo "Done"
  wsk list
}

function showenv() {
  echo IOT_ORG=$IOT_ORG
  echo IOT_API_KEY=$IOT_API_KEY
  echo IOT_API_TOKEN=$IOT_API_TOKEN
}

  case "$1" in
  "--install" )
  install
  ;;
  "--uninstall" )
  uninstall
  ;;
  "--update" )
  update
  ;;
  "--env" )
  showenv
  ;;
  "--build" )
  build
  ;;
  * )
  usage
  ;;
  esac

#!/usr/bin/env bash
set -euo pipefail

# ===============================
# Helpers
# ===============================
banner() {
  echo "============================================================"
  echo "$1"
  echo "============================================================"
}

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "❌ Required command '$1' not found. Please install it and retry."
    exit 1
  fi
}

prompt_if_empty() {
  # $1 -> varname, $2 -> prompt
  local __varname="$1"
  local __prompt="$2"
  if [[ -z "${!__varname:-}" ]]; then
    read -rp "$__prompt" "$__varname"
    export "$__varname"
  fi
}

# ===============================
# Dependencies
# ===============================
need_cmd curl
need_cmd jq
need_cmd sed
need_cmd openssl

# ===============================
# 1) Choose action: enable/disable
# ===============================
ACTION="${ACTION:-}"
if [[ -z "${ACTION}" ]]; then
  echo "What do you want to do?"
  echo "  1) Enable embed security"
  echo "  2) Disable embed security"
  read -rp "Enter 1 or 2: " choice
  case "$choice" in
    1) ACTION="enable" ;;
    2) ACTION="disable" ;;
    *) echo "❌ Invalid choice."; exit 1 ;;
  esac
fi

# ===============================
# 2) Inputs (args or prompts)
#    Args order: API_KEY, INSTANCE_ID, API_URL
# ===============================
WXO_API_KEY="${1:-${WXO_API_KEY:-}}"
WXO_INSTANCE_ID="${2:-${WXO_INSTANCE_ID:-}}"
API_URL="${3:-${API_URL:-}}"

if [[ -z "${WXO_API_KEY}" || -z "${WXO_INSTANCE_ID}" || -z "${API_URL}" ]]; then
  banner "watsonx Orchestrate Embed Security ($(echo "$ACTION" | tr '[:lower:]' '[:upper:]'))"
  echo "Please provide:"
  echo "  1) WXO_API_KEY      (IBM Cloud / SaaS API key for token exchange)"
  echo "  2) WXO_INSTANCE_ID  (Your Orchestrate instance ID)"
  echo "  3) API_URL          (Base API URL for your deployment)"
  echo
  echo "Examples:"
  echo "  WXO_API_KEY:      abcdefghijklmnopqrstuvwxyz1234567890"
  echo "  WXO_INSTANCE_ID:  12345678-abcd-1234-ef00-112233445566"
  echo "  API_URL:          https://api.us-south.watson-orchestrate.ibm.com"
  echo
fi


prompt_if_empty WXO_API_KEY    "Enter WXO_API_KEY: "
prompt_if_empty WXO_INSTANCE_ID "Enter WXO_INSTANCE_ID: "
prompt_if_empty API_URL        "Enter API_URL: "

banner "Inputs"
echo "Action:          ${ACTION}"
echo "WXO_INSTANCE_ID: ${WXO_INSTANCE_ID}"
echo "API_URL:         ${API_URL}"
echo

# ===============================
# 3) Get IAM token
# ===============================
banner "Fetching IAM Token"
WXO_TOKEN="$(
  curl --fail -sS \
    --request POST \
    --url "https://iam.platform.saas.ibm.com/siusermgr/api/1.0/apikeys/token" \
    --header 'accept: application/json' \
    --header 'content-type: application/json' \
    --data "{\"apikey\": \"${WXO_API_KEY}\"}" \
  | jq -r .token
)"

if [[ -z "${WXO_TOKEN}" || "${WXO_TOKEN}" == "null" ]]; then
  echo "❌ Failed to fetch IAM token. Check your WXO_API_KEY."
  exit 1
fi

echo "✅ Token acquired."
echo "${WXO_TOKEN}" > wxo_token.txt
echo

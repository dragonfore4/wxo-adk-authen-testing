#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# watsonx Orchestrate — Embed Security Helper (IBM Cloud / AWS / CPD)
# Enable / Disable secure-embed using a SINGLE URL input:
#   IBM Cloud/AWS:
#     https://api.<host>/instances/<INSTANCE_ID>
#   CPD:
#     https://<host>/orchestrate/<CPD_INSTANCE>/instances/<INSTANCE_ID>
#
# Args (in order) [optional]:
#   1) WXO_API_KEY (IBM Cloud/AWS only; ignored for CPD)
#   2) FULL_INSTANCE_API_URL
#
# Env overrides:
#   ACTION=enable|disable
#   IAM_URL=<explicit IAM base>        # If set (non-CPD), skips auto-selection
#
# Notes:
# - First prompt is ALWAYS the API Instance URL.
# - CPD is detected if URL contains /orchestrate/<cpd-instance>/... OR host includes "cpd".
# - CPD token via: POST https://<host>/icp4d-api/v1/authorize {username,password}
# - Non-CPD token via: IAM apikey -> token as before.
# - For CPD, v1/embed endpoints are rooted at:
#     https://<host>/orchestrate/<CPD_INSTANCE>/instances/<INSTANCE_ID>/v1/embed/secure/...
# - For IBM Cloud/AWS, endpoints are:
#     https://api.<host>/instances/<INSTANCE_ID>/v1/embed/secure/...
# ============================================================

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
  local __varname="$1"
  local __prompt="$2"
  if [[ -z "${!__varname:-}" ]]; then
    read -rp "$__prompt" "$__varname"
    export "$__varname"
  fi
}

prompt_secret_if_empty() {
  local __varname="$1"
  local __prompt="$2"
  if [[ -z "${!__varname:-}" ]]; then
    read -rs -p "$__prompt" "$__varname"
    echo
    export "$__varname"
  fi
}

# Returns base URL with any leading 'api.' stripped from the host.
strip_leading_api() {
  local in_url="$1"
  if [[ "${in_url}" =~ ^(https?://)([^/]+)(/.*)?$ ]]; then
    local scheme="${BASH_REMATCH[1]}"
    local host="${BASH_REMATCH[2]}"
    host="${host#api.}"
    echo "${scheme}${host}"
    return 0
  fi
  echo "${in_url}"
  return 0
}

# Get scheme://host from a full URL
origin_from_url() {
  local in_url="$1"
  if [[ "${in_url}" =~ ^(https?://[^/]+) ]]; then
    echo "${BASH_REMATCH[1]}"
    return 0
  fi
  echo "${in_url}"
  return 0
}

# Read a PEM file and return JSON string (jq -Rs .), normalize line endings
read_pem_as_json_string() {
  local pem_path="$1"

  if [[ ! -f "$pem_path" ]]; then
    echo "❌ PEM file not found: $pem_path" >&2
    return 1
  fi
  if [[ ! -r "$pem_path" ]]; then
    echo "❌ PEM file not readable: $pem_path" >&2
    return 1
  fi

  if grep -qE -- '-----BEGIN (RSA )?PUBLIC KEY-----' "$pem_path"; then
    : # public key — good
  elif grep -qE -- '-----BEGIN (RSA )?PRIVATE KEY-----' "$pem_path"; then
    echo "⚠️  You provided a PRIVATE key PEM. The API expects the PUBLIC key. Continuing…" >&2
  else
    echo "⚠️  File lacks standard PUBLIC/PRIVATE KEY PEM header. Continuing…" >&2
  fi

  tr -d '\r' < "$pem_path" | sed '${/^$/d;}' | jq -Rs .
}

# ===============================
# Dependencies
# ===============================
need_cmd curl
need_cmd jq
need_cmd sed
need_cmd openssl
need_cmd tr
need_cmd grep

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
# 2) Inputs (URL FIRST), then creds
# ===============================
WXO_API_KEY="${1:-${WXO_API_KEY:-}}"
FULL_INSTANCE_API_URL="${2:-${FULL_INSTANCE_API_URL:-${API_URL_WITH_INSTANCE:-}}}"

if [[ -z "${FULL_INSTANCE_API_URL}" ]]; then
  banner "watsonx Orchestrate Embed Security ($(echo "$ACTION" | tr '[:lower:]' '[:upper:]'))"
  echo "Please provide the API Instance URL:"
  echo "  • IBM Cloud/AWS:"
  echo "      https://api.<host>/instances/<INSTANCE_ID>"
  echo "  • CPD:"
  echo "      https://<host>/orchestrate/<CPD_INSTANCE>/instances/<INSTANCE_ID>"
  echo
fi

prompt_if_empty FULL_INSTANCE_API_URL "Enter API Instance URL: "

# ===============================
# 2a) Parse URL, detect CPD vs Non-CPD
# ===============================
IS_CPD="false"
API_ORIGIN="$(origin_from_url "${FULL_INSTANCE_API_URL}")"

# CPD pattern
if [[ "${FULL_INSTANCE_API_URL}" =~ ^(https?://[^/]+)/orchestrate/([^/]+)/instances/([^/?#]+) ]]; then
  IS_CPD="true"
  API_URL_BASE="${BASH_REMATCH[1]}/orchestrate/${BASH_REMATCH[2]}"
  CPD_INSTANCE_NAME="${BASH_REMATCH[2]}"
  WXO_INSTANCE_ID="${BASH_REMATCH[3]}"
# Non-CPD pattern
elif [[ "${FULL_INSTANCE_API_URL}" =~ ^(https?://[^/]+)/instances/([^/?#]+) ]]; then
  IS_CPD="false"
  API_URL_BASE="${BASH_REMATCH[1]}"
  WXO_INSTANCE_ID="${BASH_REMATCH[2]}"
else
  echo "❌ Invalid API Instance URL."
  echo "   IBM Cloud/AWS example:"
  echo "     https://api.us-south.watson-orchestrate.ibm.com/instances/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
  echo "   CPD example:"
  echo "     https://cpd-cpd-instance-1.apps.example.com/orchestrate/cpd-instance-1/instances/1757991870301390"
  echo "Got: ${FULL_INSTANCE_API_URL}"
  exit 1
fi

# Heuristic: also mark CPD if host contains 'cpd' (defensive)
if [[ "${API_ORIGIN}" == *"cpd"* ]]; then
  IS_CPD="true"
fi

banner "Inputs"
echo "Action:            ${ACTION}"
echo "WXO_INSTANCE_ID:   ${WXO_INSTANCE_ID}"
echo "API_URL_BASE:      ${API_URL_BASE}"
echo "API_ORIGIN:        ${API_ORIGIN}"
echo "Detected Platform: $([[ "${IS_CPD}" == "true" ]] && echo "CPD" || echo "IBM Cloud / AWS")"
echo

# ===============================
# 3) Token acquisition
# ===============================
if [[ "${IS_CPD}" == "true" ]]; then
  # CPD: username + password -> token at <origin>/icp4d-api/v1/authorize
  banner "Fetching CPD Token"
  CPD_USERNAME="${CPD_USERNAME:-}"
  CPD_PASSWORD="${CPD_PASSWORD:-}"
  prompt_if_empty CPD_USERNAME "Enter CPD Username: "
  prompt_secret_if_empty CPD_PASSWORD "Enter CPD Password (hidden): "

  WXO_TOKEN="$(
    curl --fail -sS \
      --request POST \
      --url "${API_ORIGIN}/icp4d-api/v1/authorize" \
      --header 'Content-Type: application/json' \
      --header 'cache-control: no-cache' \
      --data "{\"username\":\"${CPD_USERNAME}\",\"password\":\"${CPD_PASSWORD}\"}" --insecure \
    | jq -r .token
  )"

  if [[ -z "${WXO_TOKEN}" || "${WXO_TOKEN}" == "null" ]]; then
    echo "❌ Failed to fetch CPD token. Check your credentials and host."
    exit 1
  fi
  echo "✅ CPD token acquired."
  echo

else
  # IBM Cloud / AWS: API key -> IAM token selection
  if [[ -z "${WXO_API_KEY}" ]]; then
    echo "IBM Cloud/AWS flow selected."
    echo "You will be prompted for WXO_API_KEY (input hidden)."
  fi

  prompt_secret_if_empty WXO_API_KEY "Enter WXO_API_KEY (hidden): "

  # Auto-select IAM_URL unless provided
  if [[ -z "${IAM_URL:-}" ]]; then
    API_URL_NOAPI="$(strip_leading_api "${API_URL_BASE}")"
    case "${API_URL_NOAPI}" in
      # IBM Cloud - PROD
      https://au-syd.watson-orchestrate.cloud.ibm.com|\
      https://jp-tok.watson-orchestrate.cloud.ibm.com|\
      https://eu-de.watson-orchestrate.cloud.ibm.com|\
      https://eu-gb.watson-orchestrate.cloud.ibm.com|\
      https://us-south.watson-orchestrate.cloud.ibm.com|\
      https://us-east.watson-orchestrate.cloud.ibm.com|\
      https://ca-tor.watson-orchestrate.cloud.ibm.com)
        IAM_URL="https://iam.platform.saas.ibm.com"
        ;;
      # AWS - PROD
      https://ap-southeast-1.dl.watson-orchestrate.ibm.com|\
      https://ap-south-1.dl.watson-orchestrate.ibm.com|\
      https://eu-central-1.dl.watson-orchestrate.ibm.com|\
      https://dl.watson-orchestrate.ibm.com|\
      https://cio.watson-orchestrate.ibm.com)
        IAM_URL="https://iam.platform.saas.ibm.com"
        ;;
      # GovCloud (mapped to PROD IAM)
      https://origin-us-gov-east-1.watson-orchestrate.prep.ibmforusgov.com)
        IAM_URL="https://iam.platform.saas.ibm.com"
        ;;
      # STAGING / TEST
      https://us-south.watson-orchestrate.test.cloud.ibm.com|\
      https://perfus-south.watson-orchestrate.test.cloud.ibm.com|\
      https://staging-wa.watson-orchestrate.ibm.com|\
      https://wodlperf.watson-orchestrate.ibm.com|\
      https://preprod.dl.watson-orchestrate.ibm.com)
        IAM_URL="https://iam.platform.test.saas.ibm.com"
        ;;
      # DEV
      https://us-south.watson-orchestrate-dev.test.cloud.ibm.com|\
      https://dev-wa.watson-orchestrate.ibm.com|\
      https://dev-fedtest.watson-orchestrate.ibm.com)
        IAM_URL="https://iam.platform.dev.saas.ibm.com"
        ;;
      *)
        echo "⚠️  Unknown API host after normalization: ${API_URL_NOAPI}"
        echo "   Falling back to PROD IAM."
        IAM_URL="https://iam.platform.saas.ibm.com"
        ;;
    esac

    export IAM_URL
    banner "IAM URL Selected"
    echo "Normalized API host: ${API_URL_NOAPI}"
    echo "IAM_URL:             ${IAM_URL}"
    echo
  else
    banner "IAM URL Selected (from environment)"
    echo "IAM_URL: ${IAM_URL}"
    echo
  fi

  banner "Fetching IAM Token"
  WXO_TOKEN="$(
    curl --fail -sS \
      --request POST \
      --url "${IAM_URL}/siusermgr/api/1.0/apikeys/token" \
      --header 'accept: application/json' \
      --header 'content-type: application/json' \
      --data "{\"apikey\": \"${WXO_API_KEY}\"}" \
    | jq -r .token
  )"

  if [[ -z "${WXO_TOKEN}" || "${WXO_TOKEN}" == "null" ]]; then
    echo "❌ Failed to fetch IAM token. Check your WXO_API_KEY and IAM_URL."
    exit 1
  fi
  echo "✅ Token acquired."
  echo
fi

# ===============================
# 4) Endpoints (CPD vs Non-CPD)
# ===============================
if [[ "${IS_CPD}" == "true" ]]; then
  # CPD endpoints include /orchestrate/<CPD_INSTANCE>
  CONFIG_ENDPOINT="${API_URL_BASE}/instances/${WXO_INSTANCE_ID}/v1/embed/secure/config"
  GENKEY_ENDPOINT="${API_URL_BASE}/instances/${WXO_INSTANCE_ID}/v1/embed/secure/generate-key-pair"
else
  CONFIG_ENDPOINT="${API_URL_BASE}/instances/${WXO_INSTANCE_ID}/v1/embed/secure/config"
  GENKEY_ENDPOINT="${API_URL_BASE}/instances/${WXO_INSTANCE_ID}/v1/embed/secure/generate-key-pair"
fi

# ===============================
# 5) Perform action
# ===============================
if [[ "${ACTION}" == "enable" ]]; then
  banner "Enabling Embed Security"

  mkdir -p keys

  echo "Choose how to provide the CLIENT public key:"
  echo "  1) Use an existing PUBLIC key PEM (path on disk)"
  echo "  2) Generate a NEW RSA 4096 keypair now"
  read -rp "Enter 1 or 2: " key_choice

  CLIENT_PUBLIC_KEY_JSON=""
  KEY_CHOICE="$key_choice"
  case "$key_choice" in
    1)
      read -rp "Enter path to client PUBLIC key PEM (e.g., /path/to/jwtRS256.key.pub): " CLIENT_PUB_PEM_PATH
      CLIENT_PUBLIC_KEY_JSON="$(read_pem_as_json_string "$CLIENT_PUB_PEM_PATH")"
      ;;
    2)
      echo "Generating client RSA keypair in ./keys ..."
      openssl genrsa -out keys/example-jwtRS256.key 4096 >/dev/null 2>&1
      openssl rsa -in keys/example-jwtRS256.key -pubout -out keys/example-jwtRS256.key.pub >/dev/null 2>&1
      CLIENT_PUBLIC_KEY_JSON="$(read_pem_as_json_string "keys/example-jwtRS256.key.pub")"
      echo "🔐 Generated:"
      echo "  Private key: keys/example-jwtRS256.key"
      echo "  Public  key: keys/example-jwtRS256.key.pub"
      ;;
    *)
      echo "❌ Invalid choice."; exit 1 ;;
  esac

  if [[ -z "${CLIENT_PUBLIC_KEY_JSON:-}" || "${CLIENT_PUBLIC_KEY_JSON}" == "null" ]]; then
    echo "❌ Could not prepare client PUBLIC key for payload."
    exit 1
  fi

  echo "Fetching IBM public key from service..."
  curl --fail -sS \
    --request POST \
    --url "${GENKEY_ENDPOINT}" \
    --header "Authorization: Bearer ${WXO_TOKEN}" --insecure \
  | jq -r '.public_key' > keys/ibmPublic.key.pub

  if [[ ! -s keys/ibmPublic.key.pub ]]; then
    echo "❌ Failed to retrieve IBM public key."
    exit 1
  fi

  IBM_PUBLIC_KEY_JSON="$(read_pem_as_json_string "keys/ibmPublic.key.pub")"

  CONFIG_PAYLOAD=$(
    cat <<JSON
{
  "public_key": ${IBM_PUBLIC_KEY_JSON},
  "client_public_key": ${CLIENT_PUBLIC_KEY_JSON},
  "is_security_enabled": true
}
JSON
  )

  echo "POST ${CONFIG_ENDPOINT}"
  RESULT="$(
    curl --fail -sS \
      --request POST \
      --url "${CONFIG_ENDPOINT}" \
      --header "Authorization: Bearer ${WXO_TOKEN}" \
      --header 'Content-Type: application/json' \
      --data "${CONFIG_PAYLOAD}" --insecure
  )"

  echo "✅ Embed security ENABLED."
  echo "Server Response:"
  echo "${RESULT}" | jq .
  echo

  if [[ "${KEY_CHOICE}" == "1" ]]; then
    echo "📌 keys/ibmPublic.key.pub has been generated."
    echo "   ➜ Use this IBM PUBLIC key to encrypt the user payload in your client."
  else
    echo "📌 Generated key files:"
    echo "   • keys/example-jwtRS256.key            (CLIENT PRIVATE key)"
    echo "   • keys/example-jwtRS256.key.pub        (CLIENT PUBLIC key)"
    echo "   • keys/ibmPublic.key.pub               (IBM PUBLIC key)"
    echo "   ➜ Use these in your client application."
  fi
  echo

else
  banner "Disabling Embed Security"

  DISABLE_PAYLOAD='{"is_security_enabled": false}'

  echo "POST ${CONFIG_ENDPOINT}"
  RESULT="$(
    curl --fail -sS \
      --request POST \
      --url "${CONFIG_ENDPOINT}" \
      --header "Authorization: Bearer ${WXO_TOKEN}" \
      --header 'Content-Type: application/json' \
      --data "${DISABLE_PAYLOAD}" --insecure
  )"

  echo "✅ Embed security DISABLED."
  echo "Server Response:"
  echo "${RESULT}" | jq .
  echo
fi

# ===============================
# 6) Verify (GET)
# ===============================
banner "Verifying Configuration (GET)"
VERIFY="$(
  curl --fail -sS \
    --request GET \
    --url "${CONFIG_ENDPOINT}" \
    --header "Authorization: Bearer ${WXO_TOKEN}" \
    --header 'Accept: application/json' --insecure
)"
echo "✅ Current Config:"
echo "${VERIFY}" | jq .
echo
echo "Done ✅"

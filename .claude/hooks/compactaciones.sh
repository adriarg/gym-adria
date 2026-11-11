#!/bin/bash
# Cuenta las compactaciones de cada sesión y avisa desde la 2ª.
id=$(grep -o '"session_id" *: *"[^"]*"' | sed 's/.*"\([^"]*\)"$/\1/')
f="$HOME/.claude/compactaciones-${id:-sesion}"
n=$(( $(cat "$f" 2>/dev/null || echo 0) + 1 ))
echo "$n" > "$f"
echo "Compactación nº $n de esta sesión."
if [ "$n" -ge 2 ]; then
  echo "Dile a Adrià en una línea que conviene abrir una sesión nueva: lo importante ya está en GitHub."
fi
exit 0

# Landing "unete" (Praxia)

Página estática sin build: `index.html` (+ `style.css`, `app.js`, `fonts.css`), `vendedores.html` (generador de links).

## Publicar
1. En `vendedores.html` cambia la constante `BASE` (arriba del `<script>`) por la URL pública final, con barra final.
2. Sube la carpeta tal cual a cualquier hosting estático (HTTPS). Cuando quieran buscador, quita `noindex` de `index.html`.
3. Antes de publicar: `node test.mjs` debe dar verde.

## Agregar un vendedor
Abre `vendedores.html`, escribe el nombre y copia el link `BASE/?ref=<codigo>`. No hay que tocar nada más: cualquier `?ref=` válido queda registrado.
Para que salga en la tabla precargada, agrega el código a `VENDEDORES` en `vendedores.html`.

## Qué se guarda (sitio `praxia-unete` en tracking-web)
Por cada envío: nombre, WhatsApp (en `contact`), correo, `vendedor` y `ref` (el código; `directo` si no vino `?ref=`),
más la atribución normal del snippet (`src`, `utm_*`, referrer, país, dispositivo). El aviso de contacto es obligatorio para enviar.

## Leer los leads
`https://axishub.duckdns.org/track/api/leads?token=<ADMIN_TOKEN>&site=praxia-unete`
El token está en el Keychain: `security find-generic-password -s tracking-web-admin -w`. No lo pegues en archivos ni chats.
Pendiente: registrar `praxia-unete` en la tabla de sitios del README de tracking-web.

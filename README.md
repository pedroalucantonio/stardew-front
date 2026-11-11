# Armazém do Pierre

Loja de sementes inspirada em Stardew Valley. O frontend usa Vue 3 e Vite; a
API Laravel fica na pasta `../stardew-api`.

## Requisitos

- Node.js `22.18.0` ou superior
- API Laravel em execução em `http://localhost:8000`

## Desenvolvimento local

Na pasta da API, configure o arquivo `.env`, instale as dependências PHP e
inicie o servidor:

```sh
cd ../stardew-api
composer install
php artisan serve --host=127.0.0.1 --port=8000
```

Em outro terminal, na pasta do frontend:

```sh
npm ci
npm run dev
```

Abra a URL indicada pelo Vite, normalmente `http://localhost:5173`. A variável
`VITE_API_BASE_URL` em `.env` deve apontar para `http://localhost:8000`.

## Verificações

```sh
npm run build
npm run lint
```

## Publicação

Defina `VITE_API_BASE_URL=/` se o frontend e a API forem servidos pelo mesmo
domínio, com um proxy que encaminhe `/api/*` e `/sanctum/*` para o Laravel.
Se os serviços tiverem domínios diferentes, use a URL HTTPS pública da API e
configure CORS, Sanctum e cookies no ambiente da API.

Nunca inclua senhas, tokens, `APP_KEY` ou o código de administrador no frontend
ou em arquivos versionados.

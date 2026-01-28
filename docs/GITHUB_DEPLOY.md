# WorkROI Landing Page - GitHub Pages Deployment Guide

Esta guía te llevará paso a paso para tener tu landing page en vivo en **workroi.app**.

---

## ⚠️ Si ves "404 File not found"

**GitHub Pages solo sirve desde la raíz del repo (/) o desde la carpeta `/docs`.**  
El landing está en la carpeta **docs**. Debes configurar:

1. Repositorio en GitHub → **Settings** → **Pages**
2. En **Build and deployment** → **Source**: "Deploy from a branch"
3. **Branch**: `main` (o master)
4. **Folder**: elige **`/ (root)`** si el index.html está en la raíz, o **`/docs`** si el sitio está en la carpeta docs ← **usa `/docs`**
5. Guarda. En 1–2 minutos la página debería cargar.

---

## Prerequisitos

1. ✅ Tener una cuenta de GitHub
2. ✅ Git instalado en tu computadora
3. ✅ Dominio `workroi.app` comprado y acceso a DNS

---

## Paso 1: Crear Repositorio en GitHub

### Opción A: Repositorio Separado (Recomendado)

1. Ve a [github.com/new](https://github.com/new)
2. Nombra el repositorio: `workroi-landing` o `workroi.app`
3. Hazlo **Público** (requerido para GitHub Pages gratis)
4. NO inicialices con README (lo haremos desde local)
5. Click **Create repository**

### Opción B: Dentro del Repositorio de la App (tu caso)

Si prefieres mantener todo junto:
1. El landing está en la carpeta **`docs/`** (no en `landing-page/`)
2. En GitHub Pages debes elegir **Folder: /docs**

---

## Paso 2: Subir el Landing Page

### Si usas Opción A (repositorio separado):

```powershell
# Navega a la carpeta del landing page
cd C:\Users\renzo\real-takehome\landing-page

# Inicializa git
git init

# Agrega todos los archivos
git add .

# Crea el primer commit
git commit -m "Initial landing page with SEO optimization"

# Conecta con GitHub (reemplaza YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/workroi-landing.git

# Sube a GitHub
git branch -M main
git push -u origin main
```

### Si usas Opción B (dentro de real-takehome):

```powershell
# Desde el directorio raíz del proyecto
cd C:\Users\renzo\real-takehome

# Agrega la carpeta landing-page
git add landing-page/

# Commit
git commit -m "Add landing page for workroi.app"

# Push
git push origin main
```

---

## Paso 3: Configurar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (pestaña)
3. En el menú lateral, click **Pages**
4. En **Build and deployment** → **Source**, selecciona **Deploy from a branch**
5. En **Branch** elige `main` (o `master` si tu rama se llama así)
6. En **Folder** elige **`/docs`** ← así GitHub usará `docs/index.html` como página principal
7. Click **Save**

GitHub mostrará: "Your site is live at https://YOUR_USERNAME.github.io/workroi-landing"

---

## Paso 4: Configurar Dominio Personalizado (workroi.app)

### 4.1 En GitHub:

1. En **Settings > Pages**
2. En **Custom domain**, escribe: `workroi.app`
3. Click **Save**
4. Marca ✅ **Enforce HTTPS** (después de que DNS propague)

### 4.2 En tu Proveedor de Dominio (Namecheap, GoDaddy, Cloudflare, etc.):

Necesitas agregar estos registros DNS:

#### Para el dominio apex (workroi.app):

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |

#### Para www (www.workroi.app):

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME | www | YOUR_USERNAME.github.io | 3600 |

### Ejemplos por proveedor:

#### Namecheap:
1. Ve a Dashboard > Domain List > Manage
2. Click "Advanced DNS"
3. Agrega los registros A y CNAME

#### Cloudflare:
1. Ve a DNS > Records
2. Agrega los registros A (con Proxy OFF/DNS only)
3. Agrega el CNAME

#### GoDaddy:
1. My Products > DNS
2. Agrega los registros en la sección DNS Management

---

## Paso 5: Verificar Deployment

1. Espera 5-30 minutos para que DNS propague
2. Verifica en: https://workroi.app
3. Revisa HTTPS (candado verde)
4. Test en móvil

### Verificar DNS:

```powershell
# Windows PowerShell
nslookup workroi.app

# O usa un servicio online:
# https://dnschecker.org/#A/workroi.app
```

---

## Paso 6: Agregar Google Analytics (Opcional)

1. Crea cuenta en [analytics.google.com](https://analytics.google.com)
2. Obtén tu Measurement ID (G-XXXXXXXXXX)
3. Agrega antes de `</head>` en `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Paso 7: Agregar a Google Search Console

1. Ve a [search.google.com/search-console](https://search.google.com/search-console)
2. Agrega propiedad: `https://workroi.app`
3. Verifica propiedad (método DNS TXT recomendado)
4. Envía sitemap: `https://workroi.app/sitemap.xml`

### Crear sitemap.xml:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://workroi.app/</loc>
    <lastmod>2026-01-28</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://workroi.app/privacy.html</loc>
    <lastmod>2026-01-28</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://workroi.app/terms.html</loc>
    <lastmod>2026-01-28</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
```

---

## Estructura Final de Archivos

```
landing-page/
├── index.html          # Página principal
├── privacy.html        # Privacy Policy
├── terms.html          # Terms of Service
├── styles.css          # Estilos
├── script.js           # JavaScript
├── CNAME               # Dominio personalizado
├── sitemap.xml         # Para SEO
├── robots.txt          # Para crawlers
├── logo.png            # Logo (copiar de assets/)
├── favicon.png         # Favicon
├── app-store-badge.svg # Badge App Store
├── google-play-badge.svg # Badge Google Play
├── og-image.png        # Open Graph image (1200x630)
└── screenshot-hero.png # Screenshot del app
```

---

## Assets Que Necesitas Crear

### 1. og-image.png (1200x630px)
Imagen para compartir en redes sociales. Usa Figma/Canva con:
- Logo de WorkROI
- Texto: "Know Your Real Take-Home Pay"
- Screenshot del app
- Fondo limpio

### 2. screenshot-hero.png
Screenshot del app para el hero. Idealmente de 390x844px (iPhone size).

### 3. Copiar logo.png
```powershell
copy C:\Users\renzo\real-takehome\assets\logo.png C:\Users\renzo\real-takehome\landing-page\logo.png
copy C:\Users\renzo\real-takehome\assets\favicon.png C:\Users\renzo\real-takehome\landing-page\favicon.png
```

---

## Checklist Final

- [ ] Repositorio creado en GitHub
- [ ] Archivos subidos
- [ ] GitHub Pages activado
- [ ] DNS configurado
- [ ] HTTPS funcionando
- [ ] Logo y assets copiados
- [ ] og-image.png creado (1200x630)
- [ ] screenshot-hero.png agregado
- [ ] Google Analytics configurado
- [ ] Google Search Console verificado
- [ ] sitemap.xml creado
- [ ] Testear en móvil
- [ ] Testear Privacy Policy link
- [ ] Testear Terms of Service link

---

## Troubleshooting

### "404 - There isn't a GitHub Pages site here"
- Verifica que GitHub Pages está activado en Settings
- Espera unos minutos después de activar

### DNS no propaga
- Puede tomar hasta 48 horas (usualmente 30 min - 2 horas)
- Verifica registros en dnschecker.org

### HTTPS no funciona
- Espera a que DNS propague completamente
- En GitHub Pages settings, desmarca y vuelve a marcar "Enforce HTTPS"

### Cambios no aparecen
- GitHub Pages puede tener cache
- Agrega `?v=2` al URL para forzar refresh
- Espera 5-10 minutos después del push

---

## Comandos Útiles para Actualizaciones

```powershell
# Actualizar el landing page
cd C:\Users\renzo\real-takehome\landing-page
git add .
git commit -m "Update landing page content"
git push

# Ver estado
git status

# Ver historial
git log --oneline
```

---

## Soporte

Si tienes problemas:
1. Revisa la [documentación de GitHub Pages](https://docs.github.com/en/pages)
2. Verifica los logs en Settings > Pages
3. Usa las DevTools del navegador para ver errores

---

**¡Tu landing page está listo para conquistar el mundo!** 🚀

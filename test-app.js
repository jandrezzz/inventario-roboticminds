// test-app.js — Pruebas visuales con Playwright
const { chromium } = require('playwright');
const path = require('path');
const fs   = require('fs');

const SCREENSHOTS = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOTS)) fs.mkdirSync(SCREENSHOTS);

async function shot(page, name) {
  const file = path.join(SCREENSHOTS, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`  📸 ${name}.png`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx     = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await ctx.newPage();

  // ── 1. Página de Login ─────────────────────────────────────────────────────
  console.log('\n[1] Login page');
  await page.goto('http://localhost:3000/login');
  await shot(page, '01-login');
  console.log('  Título:', await page.title());

  // ── 2. Login con admin ─────────────────────────────────────────────────────
  console.log('\n[2] Login como administrador');
  await page.fill('input[name=email]',    'admin@rm.com');
  await page.fill('input[name=password]', 'admin123');
  await page.click('button[type=submit]');
  await page.waitForURL('**/dashboard');
  await shot(page, '02-dashboard-admin');
  console.log('  URL:', page.url());

  // ── 3. Verificar secciones del dashboard ───────────────────────────────────
  console.log('\n[3] Verificando secciones del dashboard');
  const alertas  = await page.locator('.alerta-titulo').count();
  const filasInv = await page.locator('.tabla tbody tr').first().count();
  console.log('  Alertas de bajo stock visibles:', alertas > 0 ? 'SÍ' : 'NO');
  console.log('  Tabla de inventario con filas:', filasInv > 0 ? 'SÍ' : 'NO');

  // ── 4. Formulario de nuevo componente ──────────────────────────────────────
  console.log('\n[4] Crear nuevo componente');
  await page.click('a[href="/componentes/nuevo"]');
  await page.waitForURL('**/componentes/nuevo');
  await shot(page, '03-form-nuevo');

  await page.fill('input[name=nombre]',          'Raspberry Pi 4B');
  await page.fill('textarea[name=descripcion]',  'Computadora de placa única 4GB RAM');
  await page.fill('input[name=categoria]',       'Microcontroladores');
  await page.fill('input[name=precio_unitario]', '45.00');
  await page.fill('input[name=cantidad]',        '2');
  await page.fill('input[name=stock_minimo]',    '5');
  await page.click('button[type=submit]');
  await page.waitForURL('**/dashboard');
  await shot(page, '04-dashboard-despues-crear');

  const mensajeExito = await page.locator('.alerta-exito').textContent().catch(() => '');
  console.log('  Mensaje tras crear:', mensajeExito.trim() || '(no visible)');

  // ── 5. Editar componente ───────────────────────────────────────────────────
  console.log('\n[5] Editar un componente');
  const btnEditar = page.locator('a.btn-secundario').first();
  await btnEditar.click();
  await page.waitForURL('**/editar');
  await shot(page, '05-form-editar');
  await page.fill('input[name=cantidad]', '999');
  await page.click('button[type=submit]');
  await page.waitForURL('**/dashboard');
  await shot(page, '06-dashboard-despues-editar');
  console.log('  Edición completada');

  // ── 6. Cerrar sesión y probar con operador ─────────────────────────────────
  console.log('\n[6] Cerrar sesión y login como operador');
  await page.click('a[href="/logout"]');
  await page.waitForURL('**/login');
  await page.fill('input[name=email]',    'operador@rm.com');
  await page.fill('input[name=password]', 'oper123');
  await page.click('button[type=submit]');
  await page.waitForURL('**/dashboard');
  await shot(page, '07-dashboard-operador');

  const btnNuevo    = await page.locator('a[href="/componentes/nuevo"]').count();
  const btnEliminar = await page.locator('button.btn-peligro').count();
  console.log('  Botón "Nuevo Componente" visible:', btnNuevo > 0 ? 'SÍ (error)' : 'NO (correcto)');
  console.log('  Botones Eliminar visibles:',        btnEliminar > 0 ? 'SÍ (error)' : 'NO (correcto)');
  console.log('  Historial visible:',
    await page.locator('text=Historial de Movimientos').count() > 0 ? 'SÍ' : 'NO'
  );

  await browser.close();
  console.log(`\n✅ Pruebas completadas. Capturas en: ${SCREENSHOTS}\n`);
})();

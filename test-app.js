const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOTS)) fs.mkdirSync(SCREENSHOTS);

async function shot(page, name) {
  await page.screenshot({ path: path.join(SCREENSHOTS, `${name}.png`), fullPage: true });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();

  await page.goto('http://localhost:3000/login');
  await shot(page, '01-login');

  await page.fill('input[name=email]', 'admin@rm.com');
  await page.fill('input[name=password]', 'admin123');
  await page.click('button[type=submit]');
  await page.waitForURL('**/dashboard');
  await shot(page, '02-dashboard-admin');

  await page.click('a[href="/componentes/nuevo"]');
  await page.waitForURL('**/componentes/nuevo');
  await page.fill('input[name=nombre]', 'Raspberry Pi 4B');
  await page.fill('textarea[name=descripcion]', 'Computadora de placa única 4GB RAM');
  await page.fill('input[name=categoria]', 'Microcontroladores');
  await page.fill('input[name=precio_unitario]', '45.00');
  await page.fill('input[name=cantidad]', '2');
  await page.fill('input[name=stock_minimo]', '5');
  await page.click('button[type=submit]');
  await page.waitForURL('**/dashboard');
  await shot(page, '03-dashboard-tras-crear');

  const btnEditar = page.locator('a.btn-secundario').first();
  await btnEditar.click();
  await page.waitForURL('**/editar');
  await page.fill('input[name=cantidad]', '999');
  await page.click('button[type=submit]');
  await page.waitForURL('**/dashboard');
  await shot(page, '04-dashboard-tras-editar');

  await page.click('a[href="/logout"]');
  await page.waitForURL('**/login');
  await page.fill('input[name=email]', 'operador@rm.com');
  await page.fill('input[name=password]', 'oper123');
  await page.click('button[type=submit]');
  await page.waitForURL('**/dashboard');
  await shot(page, '05-dashboard-operador');

  await browser.close();
  console.log('Pruebas completadas.');
})();

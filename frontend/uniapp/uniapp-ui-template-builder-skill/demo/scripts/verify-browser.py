import asyncio, json, os
from pathlib import Path
from playwright.async_api import async_playwright
BASE = os.environ.get('PROFILE_DEMO_URL', 'http://127.0.0.1:5186/')
OUT = Path(__file__).resolve().parents[1] / 'screenshots'
async def main():
 OUT.mkdir(exist_ok=True)
 async with async_playwright() as p:
  browser=await p.chromium.launch(channel='msedge',headless=True)
  errors=[];checks=[]
  expected={'simple':'林小满','service':'陈雨','commerce':'小林同学','enterprise':'王晨','member':'晨光与山海'}
  for scene,nickname in expected.items():
   page=await browser.new_page(viewport={'width':390,'height':1000},device_scale_factor=2)
   page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(BASE+'#/pages/index?scene='+scene+'&preview=1',wait_until='networkidle',timeout=60000)
   assert nickname in await page.locator('.nickname').inner_text(),scene
   await page.screenshot(path=str(OUT/(scene+'.png')))
   for width in [320,390,430,768]:
    await page.set_viewport_size({'width':width,'height':1000});await page.wait_for_timeout(200)
    result=await page.evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})')
    assert result['scroll']<=width,(scene,result)
    checks.append({'scene':scene,**result})
   await page.close()
  page=await browser.new_page(viewport={'width':390,'height':1000},device_scale_factor=2)
  page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(BASE+'#/pages/index?scene=member',wait_until='networkidle')
  await page.get_by_text('立即签到',exact=True).click();await page.wait_for_timeout(600)
  assert await page.get_by_text('今日已签到',exact=True).count()==1
  assert '成长值 2690' in await page.locator('body').inner_text()
  await page.get_by_text('今日已签到',exact=True).dispatch_event('click');await page.wait_for_timeout(100)
  assert '成长值 2690' in await page.locator('body').inner_text()
  for label,text in [('未登录','登录后查看个人中心'),('失败','个人资料加载失败'),('加载','正在加载个人资料…'),('空商品','暂时没有商品')]:
   await page.get_by_text(label,exact=True).click();assert text in await page.locator('body').inner_text()
  await page.get_by_text('默认',exact=True).click();await page.get_by_text('长昵称',exact=True).click()
  assert '这是一位昵称很长' in await page.locator('body').inner_text()
  await page.get_by_text('图片失败',exact=True).click();await page.wait_for_timeout(400)
  await page.screenshot(path=str(OUT/'member-image-fallback.png'))
  await page.locator('.menu-row').first.click()
  assert await page.get_by_text('当前是本地交互样例；未连接真实后端。',exact=True).count()==1
  await page.get_by_text('关闭',exact=True).click()
  await page.get_by_text('失败',exact=True).click();await page.get_by_text('重试',exact=True).click()
  assert await page.locator('.nickname').count()==1
  await page.get_by_text('暗色',exact=True).click()
  assert await page.locator('.profile-shell').get_attribute('data-theme') == 'dark'
  await page.screenshot(path=str(OUT/'member-dark.png'))
  assert not errors,errors
  (OUT/'verification.json').write_text(json.dumps({'checks':checks,'runtimeErrors':errors,'behavior':['签到只加一次积分','未登录/失败/加载/空商品','长昵称与图片失败','菜单弹层开关','错误重试'],'note':'H5 Edge browser checks, not device verification.'},ensure_ascii=False,indent=2),encoding='utf-8')
  print('PASS:',len(checks),'layout cases + states and interactions. Runtime errors:',len(errors))
  await browser.close()
asyncio.run(main())

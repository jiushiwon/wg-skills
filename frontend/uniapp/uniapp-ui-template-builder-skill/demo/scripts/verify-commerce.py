import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--url',default='http://127.0.0.1:5194');parser.add_argument('--output',type=Path,default=Path('screenshots/commerce'));args=parser.parse_args();args.output.mkdir(parents=True,exist_ok=True)
checks=[]
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge',headless=True);page=b.new_page(device_scale_factor=2);errors=[];bad=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('response',lambda r:bad.append(r.url) if r.status>=400 and '/static/commerce/' in r.url else None)
 for i in range(1,9):
  for width in [320,390,768]:
   page.set_viewport_size({'width':width,'height':844});page.goto('about:blank');page.goto(f'{args.url}/#/pages/commerce?style=S{i}&theme=forest&categoryMode=multi');page.wait_for_selector('.base-tabbar');page.wait_for_timeout(200)
   assert page.locator('.product').count()==4,(i,width)
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),(i,width,'overflow')
   assert page.locator('.search-bar__icon').count()==1
   if i==1:assert page.get_by_text('全部分类',exact=True).count()==0
   else:
    page.get_by_text('全部分类',exact=True).first.click();page.wait_for_timeout(350)
    box=page.locator('.popup-mask.show').bounding_box();assert box and box['y']<=1 and box['height']>=843
    page.locator('.channel-grid').get_by_text('数码设备',exact=True).click();page.wait_for_timeout(300);assert page.locator('.product').count()==2
   page.locator('input').fill('不存在');page.wait_for_timeout(100);assert page.get_by_text('没有找到相关商品',exact=True).is_visible();page.locator('input').fill('');page.wait_for_timeout(100)
   page.locator('.add-cart').first.click();page.locator('.base-tabbar').get_by_text('购物车',exact=True).click();assert page.get_by_text('购物车 / 3 件',exact=True).is_visible()
   page.locator('.base-tabbar').get_by_text('钱包',exact=True).click();assert page.get_by_text('我的钱包 / 可用余额',exact=True).is_visible()
   checks.append({'style':f'S{i}','width':width,'passed':True})
 assert not errors,errors
 assert not bad,bad
 b.close()
(args.output/'checks.json').write_text(json.dumps(checks,indent=2),encoding='utf-8');print('PASS',len(checks),'combinations; assets, mask, filtering, search, cart, wallet')

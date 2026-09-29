# 涓婚绯荤粺鎺ュ叆涓?fallback

鏈枃浠惰鏄庢湰 skill 缁勪欢濡備綍鎺ュ叆 uniapp-theme-skill 涓婚绯荤粺锛屼互鍙婄洰鏍囬」鐩棤涓婚绯荤粺鏃剁殑纭紪鐮佹浛鎹㈡柟妗堛€?
## 1. 涓婚鍙橀噺娓呭崟锛堢粍浠朵娇鐢ㄥ埌鐨勶級

缁勪欢鍏ㄩ儴鏍峰紡鍙紩鐢ㄤ笅琛ㄥ彉閲忥紙婧愯嚜 `uniapp-theme-skill` 鐨?color-scale / size-scale / radius-scale锛夛細

### 棰滆壊

| 鍙橀噺 | 璇存槑 | 缁勪欢浣跨敤鍦烘櫙 |
|------|------|--------------|
| `--color-primary` | 涓昏壊 | 楂樹寒鏂囧瓧銆佽嚜宸辨秷鎭皵娉°€佷富鎸夐挳銆乀ab 婵€娲汇€侀摼鎺ヨ壊 |
| `--color-bg-page` | 椤甸潰鑳屾櫙 | 椤甸潰鏍硅儗鏅?|
| `--color-bg-surface` | 鍗＄墖/杈撳叆/姘旀场鑳屾櫙 | BaseCard銆佸鏂规皵娉°€佽緭鍏ユ |
| `--color-bg-tinted` | 娴呰壊寮鸿皟搴?| 鏍囩搴曘€佺偣璧?璇勮搴曘€佸崰浣嶅簳 |
| `--color-text-primary` | 涓绘枃瀛?| 鏍囬銆佹鏂?|
| `--color-text-secondary` | 娆¤鏂囧瓧 | 鎻忚堪 |
| `--color-text-tertiary` | 寮卞寲鏂囧瓧 | 鏃堕棿銆佸崰浣嶃€佺澶?|
| `--color-border` | 杈规 | 澶嶉€夋鎻忚竟銆佹寜閽弿杈?|
| `--color-border-light` | 缁嗚竟妗?| 鍒嗗壊绾裤€佹弿杈?|
| `--color-error` | 閿欒/浠锋牸绾?| 浠锋牸銆佽鏍囥€佸け璐ユ€?|
| `--white` | 鍙嶇櫧鏂囧瓧 | 涓婚鑹蹭笂鐨勬枃瀛?|

### 灏哄

| 鍙橀噺 | 璇存槑 |
|------|------|
| `--spacing-xs / sm / md / lg / xl / 2xl / 3xl` | 闂磋窛闃舵锛?/16/24/32/48/64/96rpx锛?|
| `--font-xs / sm / md / lg / xl / 2xl` | 瀛楀彿闃舵 |
| `--height-btn-sm / md / lg / xl` | 鎸夐挳/杈撳叆/瀵艰埅鏍忛珮搴?|
| `--height-avatar-sm / md / lg` | 澶村儚灏哄 |
| `--icon-xs / sm / md / lg` | 鍥炬爣/澶嶉€夋/瑙掓爣灏哄 |
| `--status-bar-height` | 鐘舵€佹爮楂樺害锛坆ase-navbar锛孉pp.vue 瀹氫箟锛岃 搂5锛?|

### 鍦嗚

| 鍙橀噺 | 璇存槑 |
|------|------|
| `--radius-card` | 鍗＄墖鍦嗚锛圔aseCard 榛樿锛?|
| `--radius-btn` | 鎸夐挳/杈撳叆妗嗚兌鍥婂渾瑙?|
| `--radius-avatar` | 澶村儚鍦嗚 |
| `--radius-image` | 鍥剧墖鍦嗚 |
| `--radius-tag` | 鏍囩鍦嗚 |
| `--radius-sm / lg` | 姘旀场瑙?鍒楄〃椤瑰渾瑙?|
| `--radius-full` | 鑳跺泭鎸夐挳銆佽鏍囥€佸ご鍍忥紙= 9999rpx锛?|

## 2. 鏃犱富棰樼郴缁?fallback 纭紪鐮佹浛鎹㈣〃

> 浣跨敤鍓嶆彁锛氱洰鏍囬」鐩?*娌℃湁**涓婚绯荤粺锛堟棤 `--color-primary` / `--radius-card` 绛夊彉閲忥級锛屼笖鐢ㄦ埛閫夋嫨鐩存帴纭紪鐮侊紙鑰岄潪鍏堝垵濮嬪寲 uniapp-theme-skill锛夈€傛鏃跺厑璁稿啓姝伙紝浣嗕粛搴旂粺涓€鑹插€硷紝鏂逛究鏃ュ悗鎺ュ叆涓婚銆?
鐢熸垚鏃舵妸姣忎釜 `var(--xxx)` 鏇挎崲涓轰笅琛ㄩ粯璁ゅ€硷紙鍙栬嚜 business 鍟嗗姟椋庝富棰橈紝鍙寜鐢ㄦ埛鍝佺墝鑹茶皟鏁达級锛?
| 鍙橀噺 | 榛樿鍊?|
|------|--------|
| `--color-primary` | `#2563EB` |
| `--color-bg-page` | `#F5F6F8` |
| `--color-bg-surface` | `#FFFFFF` |
| `--color-bg-tinted` | `#EFF6FF` |
| `--color-text-primary` | `#171717` |
| `--color-text-secondary` | `#737373` |
| `--color-text-tertiary` | `#A3A3A3` |
| `--color-border` | `#E5E7EB` |
| `--color-border-light` | `#F0F0F0` |
| `--color-error` | `#EF4444` |
| `--white` | `#FFFFFF` |
| `--spacing-xs/sm/md/lg/xl/2xl/3xl` | `8rpx / 16rpx / 24rpx / 32rpx / 48rpx / 64rpx / 96rpx` |
| `--font-xs/sm/md/lg/xl/2xl` | `22rpx / 24rpx / 28rpx / 32rpx / 36rpx / 44rpx` |
| `--height-btn-sm/md/lg/xl` | `56rpx / 72rpx / 88rpx / 96rpx` |
| `--height-avatar-sm/md/lg` | `64rpx / 96rpx / 128rpx` |
| `--icon-xs/sm/md/lg` | `24rpx / 32rpx / 40rpx / 48rpx` |
| `--radius-card` | `16rpx` |
| `--radius-btn` | `16rpx` |
| `--radius-avatar` | `9999rpx`锛堝榻愪富棰?`--radius-full`锛屾鏂瑰舰澶村儚涓嬬瓑鍚屽渾褰級 |
| `--radius-image` | `8rpx` |
| `--radius-tag` | `8rpx` |
| `--radius-sm` | `8rpx` |
| `--radius-lg` | `24rpx` |
| `--radius-full` | `9999rpx` |
| `--status-bar-height` | `0`锛圚5/闈炲皬绋嬪簭鏃犻渶锛?|
| `calc((100% - 2 * var(--spacing-xs)) / 3)` 绛?| 鐩存帴鐢?`calc((100% - 16rpx) / 3)` 绛変环鏇挎崲 |

> 鎺ㄨ崘鍋氭硶锛氫笌鍏堕€愪釜鏇挎崲锛屼笉濡傜洿鎺ュ湪椤圭洰 `src/styles/theme.css`锛堟垨 App.vue 鐨?`<style>`锛夐噷涓€娆℃€у畾涔夎繖缁?CSS 鍙橀噺锛岀粍浠跺師鏍峰鍒跺嵆鍙€傝繖鏍锋棩鍚庢帴鍏?uniapp-theme-skill 涔熸棤闇€鏀瑰姩缁勪欢銆?
## 3. easycom 娉ㄥ唽

**鏂瑰紡 A锛歛utoscan锛堥粯璁ゆ帹鑽愶級**

```json
// pages.json
{
  "easycom": {
    "autoscan": true
  }
}
```

uni-app 浼氳嚜鍔ㄦ壂鎻?`src/components/缁勪欢鍚?缁勪欢鍚?vue`锛屾妸鐩綍鍚嶆敞鍐屼负鍏ㄥ眬鏍囩锛坘ebab-case锛夛細
`base-card/base-card.vue` 鈫?`<base-card>`锛宍chat-page/chat-page.vue` 鈫?`<chat-page>`銆?
**鏂瑰紡 B锛氳嚜瀹氫箟瑙勫垯锛堢粍浠舵斁鍦ㄥ叕鍏卞瓙鐩綍鏃讹級**

```json
// pages.json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^base-(.*)": "@/components/base/$1/$1.vue",
      "^page-(.*)": "@/components/page/$1/$1.vue"
    }
  }
}
```

**鏂瑰紡 C锛氭墜鍔ㄥ鍏?*

```vue
<script setup lang="ts">
import ChatPage from '@/components/chat-page/chat-page.vue'
import BaseCard from '@/components/base-card/base-card.vue'
</script>
```

## 4. 涓婚鍙橀噺瑕嗙洊绀轰緥

缁勪欢宸叉妸澶ч儴鍒嗗瑙傚弬鏁版毚闇蹭负 props锛坄radius` / `padding` / `background` / `margin`锛夛紝涓埆闇€瑕佸叏灞€璋冩暣鏃剁洿鎺ヨ鐩栦富棰樺彉閲忥細

```scss
// 鍏ㄥ眬/椤甸潰绾ц鐩栵紙涓婚绯荤粺鍏佽鐨勫湴鏂癸級
.page-mall {
  --color-primary: #10B981;   // 璇ュ尯鍩熶富鑹叉崲缁?  --radius-card: 24rpx;       // 鍗＄墖鍦嗚鍔犲ぇ
}
```

## 5. 鐘舵€佹爮閫傞厤锛坆ase-navbar锛?
`base-navbar` 鐨勭姸鎬佹爮楂樺害鐢卞唴閮ㄧ殑 `.bn-status-bar` 鍗犱綅琛屾壙鎷咃紙`showStatusBar=true` 鏃?`height: statusBarHeight`锛夛紝鍚搁《鍗犱綅楂樺害 = `statusBarHeight + --height-btn-xl`銆備笁绉嶆柟寮忎换閫夛細

```css
/* 鏂瑰紡 1锛欰pp.vue 鍏ㄥ眬瀹氫箟锛堝皬绋嬪簭绔帹鑽愶紝鍊兼潵鑷?uni.getSystemInfoSync().statusBarHeight锛?*/
page { --status-bar-height: 44px; }
```

```vue
<!-- 鏂瑰紡 2锛氶〉闈紶 prop -->
<base-navbar status-bar-height="44px" ... />
```

```vue
<!-- 鏂瑰紡 3锛欽S 鍔ㄦ€佷紶鍏?-->
<base-navbar :status-bar-height="`${statusBarHeight}px`" ... />
<script setup lang="ts">
import { ref } from 'vue'
const statusBarHeight = ref(0)
uni.getSystemInfoSync().statusBarHeight && (statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight)
</script>
```

> H5 / 闈炲皬绋嬪簭绔棤闇€鐘舵€佹爮鍗犱綅锛屼繚鎸侀粯璁?0 鍗冲彲銆?
## 6. 涓庡叾浠?uniapp 鎶€鑳界殑鍗忓悓

鏈?skill 浣嶄簬 uniapp 鎶€鑳介摼璺殑銆岄〉闈㈢粍浠跺眰銆嶏紝涓庝互涓嬫妧鑳藉崗鍚岋細

### 6.1 uniapp-standard-skill锛堥€氱敤瑙勮寖锛屽墠缃級

- **绾㈢嚎**锛氱粍浠堕伒寰叾 R15锛圫CSS 鐢?Token锛夈€丷05锛堥暱鍒楄〃鍒嗛〉锛宍tab-list-page` 鐨?`loadMore` 鐢遍〉闈㈠眰瀹炵幇锛夈€丷08锛堢姝㈢‖缂栫爜锛岄厤缃蛋 config锛夌瓑銆?- **鐩綍/鍛藉悕**锛氱粍浠剁洰褰曞皬鍐?kebab-case銆乣components/<name>/<name>.vue`锛岀鍚?easycom 榛樿瑙勫垯锛涜嫢椤圭洰鎸?`components/common/<Name>/index.vue` 缁勭粐锛屾妸缁勪欢鏀惧埌瀵瑰簲浣嶇疆骞舵敼鐢?easycom `custom` 瑙勫垯鎴栨墜鍔?import銆?- **缁勪欢閫氫俊**锛氶伒寰叾缁勪欢閫氫俊瑙勮寖锛坧rops 鍗曞悜銆佷簨浠跺悜涓娿€乻lot 鎻掓Ы锛夛紝鏈?skill 缁勪欢鍏ㄩ儴婊¤冻銆?
### 6.2 uniapp-theme-skill锛堜富棰樼郴缁燂紝渚濊禆锛?
- 缁勪欢鍏ㄩ儴鏍峰紡寮曠敤鍏?CSS 鍙橀噺锛坄var(--color-primary)` / `var(--radius-card)` / `var(--spacing-md)` ...锛夛紝瀹炵幇杩愯鏃舵崲鑲ゃ€?- 鏃犱富棰樼郴缁熸椂鎸?搂2 fallback 琛ㄧ‖缂栫爜锛涙帹鑽愬厛鍦ㄩ」鐩叏灞€涓€娆℃€у畾涔夎繖缁?CSS 鍙橀噺锛堝彲寮曠敤 style-skill 鐨?SCSS 鍙橀噺鍊肩敓鎴愶級锛岀粍浠跺師鏍峰鍒讹紝鏃ュ悗鎺ュ叆 theme-skill 闆舵敼鍔ㄣ€?
### 6.3 uniapp-style-skill锛堣璁¤鑼冿紝蹇呭惊锛?
- 瑙嗚瑙勮寖锛堟帓鐗堛€侀棿璺濄€佽涔夎壊銆佸渾瑙掞級閬靛惊鍏?Design Tokens 浣撶郴銆?- **SCSS token 涓?CSS 鍙橀噺妗ユ帴**锛歴tyle-skill 鐨?`$color-primary` 绛夋槸缂栬瘧鏈?SCSS 鍙橀噺锛宼heme-skill 鐨?`--color-primary` 鏄繍琛屾椂 CSS 鍙橀噺銆備簩閫変竴淇濇寔鍗曚竴鏉ユ簮锛?  - **鎺ㄨ崘**锛氫富棰樼郴缁燂紙CSS 鍙橀噺锛変綔涓哄敮涓€鏉ユ簮锛孲CSS 閲?`$color-primary: var(--color-primary)` 鍙嶅悜寮曠敤锛岀紪璇戞湡鑾峰緱 CSS 鍙橀噺寮曠敤锛岃繍琛屾椂鍒囨崲涓婚銆?  - 鎴?SCSS 鍙橀噺浣滀负鏉ユ簮锛岀敓鎴?CSS 鍙橀噺鏂囦欢鏃舵妸 SCSS 鍊煎啓杩涘幓銆?- 缁勪欢浠ｇ爜瑙勮寖锛坰coped銆乀S Props銆佸浘鐗囧厹搴曘€佺偣鍑诲尯 鈮?8rpx锛夋寜 style-skill D01-D32 绾㈢嚎鑷煡銆?
### 6.4 uniapp-app-generate-skill锛堥鏋?+ 鍘熷瓙缁勪欢锛?
- 椤甸潰缁勪欢鏄€岄〉闈㈤鏋跺眰銆嶏紝app-generate 鐨勫叡浜粍浠讹紙AppButton / AppTab / AppInput / AppPopup / AppNavbar锛夋槸銆屽師瀛?UI 灞傘€嶃€?- 鑻ラ」鐩凡鐢熸垚鍏变韩缁勪欢浣撶郴锛氱敤鏈?skill 缁勪欢鐨?`#tab` / `#footer` / `#navbar` / `#plus-panel` / `#header` 绛?slot 娉ㄥ叆鍏变韩缁勪欢锛涘唴閮ㄨ嚜缁樼殑鍩虹 UI锛坱ab 鏍忋€佽緭鍏ユ爮銆佸簳閮ㄦ寜閽級鍙綔涓洪粯璁ゅ疄鐜颁繚鐣欐垨鎸夐渶鏇挎崲锛岄伩鍏嶉噸澶嶉€犺疆瀛愩€?
### 6.5 uniapp-request-skill锛堟暟鎹眰锛?
- 缁勪欢鍙帴鏀舵暟鎹紙`list` / `messages` / `feedList` / `groups`锛夛紝鍓綔鐢紙鍒嗛〉銆佸姞杞姐€佸彂閫併€佺偣璧烇級鐢遍〉闈㈠眰璋冪敤 request-skill 灏佽澶勭悊锛岀粍浠跺彧 `emit` 浜嬩欢銆傜粍浠跺唴绂佹鐩存帴 `uni.request`銆?

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppInput } from '@/components/AppInput';
import { isEmpty, isPhone } from '@/utils/validate';
import { storage } from '@/utils/storage';

const DRAFT_KEY = 'demo_form_draft';

const name = ref('');
const phone = ref('');
const note = ref('');

const errors = ref({
  name: '',
  phone: '',
});

interface Draft {
  name: string;
  phone: string;
  note: string;
}

function validate(): boolean {
  errors.value.name = isEmpty(name.value) ? '请输入名称' : '';
  errors.value.phone = !isPhone(phone.value) ? '请输入正确的手机号' : '';
  return !errors.value.name && !errors.value.phone;
}

function saveDraft() {
  storage.set<Draft>(DRAFT_KEY, {
    name: name.value,
    phone: phone.value,
    note: note.value,
  });
}

function loadDraft() {
  const draft = storage.get<Draft>(DRAFT_KEY);
  if (draft) {
    name.value = draft.name;
    phone.value = draft.phone;
    note.value = draft.note;
  }
}

function submit() {
  if (!validate()) {
    uni.showToast({ title: '请检查表单', icon: 'none' });
    return;
  }

  // 实际项目中此处调用接口提交
  uni.showToast({ title: '提交成功', icon: 'success' });
  storage.remove(DRAFT_KEY);

  setTimeout(() => {
    uni.navigateBack();
  }, 800);
}

onLoad(() => loadDraft());

onUnload(() => saveDraft());
</script>

<template>
  <view class="page form-page">
    <text class="form-page__title">
      表单示例
    </text>

    <AppCard class="form-page__card">
      <AppInput
        v-model="name"
        label="名称"
        placeholder="请输入名称"
        :error="errors.name"
      />

      <AppInput
        v-model="phone"
        label="手机号"
        placeholder="请输入手机号"
        type="number"
        :error="errors.phone"
      />

      <AppInput
        v-model="note"
        label="备注"
        placeholder="请输入备注（可选）"
      />

      <AppButton
        class="form-page__submit"
        type="primary"
        @click="submit"
      >
        提交
      </AppButton>
    </AppCard>
  </view>
</template>

<style lang="scss" scoped>
.form-page {
  padding: $comp-page-padding;
  background: $color-bg-secondary;

  &__title {
    display: block;
    font-size: $font-headline;
    font-weight: 600;
    color: $color-text-primary;
    margin-bottom: $spacing-lg;
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  &__submit {
    margin-top: $spacing-md;
  }
}
</style>

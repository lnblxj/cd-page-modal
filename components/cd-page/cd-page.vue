<template>
	<view class="cd-page-container" :style="containerStyle">
		<view class="header-container">
			<slot name="header"></slot>
		</view>
		<view class="cd-page-inner" :style="innerStyle">
			<slot></slot>
		</view>
		<slot name="footer"></slot>
		<cd-page-modal ref="modalRef"></cd-page-modal>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue';
import CdPageModal from '../cd-page-modal/cd-page-modal.vue';

const props = defineProps({
	padding: {
		type: [String, Number],
		default: '10rpx'
	},
	minHeight: {
		type: [String, Number],
		default: '100vh'
	},
	backgroundColor: {
		type: String,
		default: '#F7F9FE'
	}
});

const containerStyle = computed(() => ({
	backgroundColor: props.backgroundColor,
	minHeight: typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight
}));

const innerStyle = computed(() => ({
	padding: typeof props.padding === 'number' ? `${props.padding}px` : props.padding
}));

const modalRef = ref(null);

const showModal = (config, confirmCallback, cancelCallback) => {
	if (modalRef.value) {
		modalRef.value.showModal(config, confirmCallback, cancelCallback);
	}
};

const closeModal = () => {
	if (modalRef.value) {
		modalRef.value.closeModal();
	}
};

defineExpose({
	showModal,
	closeModal
});
</script>

<style scoped>
.cd-page-container {
	width: 100%;
	height: auto;
	position: relative;
}

.cd-page-inner {
	box-sizing: border-box;
}

.header-container{
	width: 100%;
}

/* #ifdef WEB */
.cd-page-inner {
	padding-top: 100rpx !important;
	width: 90%;
	margin: 0 auto;
}
/* #endif */

/* #ifdef APP */
.cd-page-inner {
	padding-top: 84px !important;
	width: 100%;
}
/* #endif */
</style>
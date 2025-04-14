<template>
	<view class="cd-page-modal" :class="customClass">
		<!-- 模态框遮罩层 -->
		<view 
			v-if="modalShow && modalConfig.overlay" 
			class="cd-modal-overlay" 
			:class="[
				modalConfig.overlayClass,
				{ 'cd-modal-overlay-fullscreen': modalConfig.maskFullScreen }
			]"
			:style="{ 
				backgroundColor: modalConfig.overlayColor,
				opacity: modalConfig.overlayOpacity,
				zIndex: modalConfig.zIndex,
				backdropFilter: modalConfig.overlayBlur > 0 ? `blur(${modalConfig.overlayBlur}px)` : 'none'
			}"
			@click="handleOverlayClick"
		></view>
		
		<!-- 模态框主体 -->
		<view 
			v-if="modalShow"
			class="cd-modal-container" 
			:class="{
				'cd-modal-fullscreen': modalConfig.fullscreen,
				[`cd-modal-animation-${modalConfig.animationType}`]: true
			}"
			:style="{
				width: modalConfig.fullscreen ? '100%' : `${modalConfig.width}rpx`,
				borderRadius: modalConfig.fullscreen ? '0' : `${modalConfig.borderRadius}rpx`,
				zIndex: modalConfig.zIndex + 1,
				transform: modalConfig.negativeTop ? `translateY(-${modalConfig.negativeTop}rpx)` : '',
				animationDuration: `${modalConfig.animationDuration}ms`,
			}"
		>
			<!-- 关闭按钮 (独立于标题栏) -->
			<view 
				v-if="modalConfig.showCloseIcon && modalConfig.closeIconPosition !== 'in-header'" 
				:class="[
					'cd-modal-close-icon-absolute',
					`cd-modal-close-icon-${modalConfig.closeIconPosition || 'top-right'}`
				]"
				@click="handleCancel"
			>×</view>
			
			<!-- 模态框标题 -->
			<view 
				v-if="modalConfig.showTitle" 
				class="cd-modal-header"
				:style="modalConfig.titleStyle"
			>
				<text class="cd-modal-title">{{ modalConfig.title }}</text>
				<!-- 标题栏中的关闭按钮 -->
				<view 
					v-if="modalConfig.showCloseIcon && modalConfig.closeIconPosition === 'in-header'" 
					class="cd-modal-close-icon"
					@click="handleCancel"
				>×</view>
			</view>
			
			<!-- 模态框内容 -->
			<view 
				class="cd-modal-body"
				:style="[
					modalConfig.contentStyle,
					{ padding: modalConfig.useSlot || modalConfig.richContent ? '0' : '30rpx' }
				]"
			>
				<!-- 使用自定义插槽或富文本内容 -->
				<template v-if="modalConfig.useSlot || modalConfig.richContent">
					<slot>
						<!-- 富文本内容 -->
						<view v-if="modalConfig.richContent" class="cd-modal-rich-content">
							<template v-if="hasInputElements">
								<view class="cd-modal-html-wrapper" v-html="processedRichContent" @input="handleInputChange"></view>
							</template>
							<view v-else class="cd-modal-html-wrapper" v-html="processedRichContent"></view>
						</view>
						<!-- 普通文本内容 -->
						<view v-else-if="modalConfig.content" class="cd-modal-content">
							{{ modalConfig.content }}
						</view>
					</slot>
				</template>
				
				<!-- 普通文本内容 -->
				<view v-else class="cd-modal-content">
					{{ modalConfig.content }}
				</view>
				
				<!-- 输入框区域 -->
				<view v-if="modalConfig.showInput" class="cd-modal-input-area">
					<!-- 单行输入框 -->
					<input 
						v-if="modalConfig.inputType !== 'textarea'"
						class="cd-modal-input"
						:type="modalConfig.inputType"
						:value="inputValue"
						:placeholder="modalConfig.inputPlaceholder"
						:maxlength="modalConfig.inputMaxlength"
						@input="handleTextInput"
					/>
					
					<!-- 多行输入框 -->
					<textarea 
						v-else
						class="cd-modal-textarea"
						:value="inputValue"
						:placeholder="modalConfig.inputPlaceholder"
						:maxlength="modalConfig.inputMaxlength"
						:rows="modalConfig.inputRows"
						@input="handleTextInput"
					></textarea>
					
					<!-- 输入错误提示 -->
					<view v-if="inputError" class="cd-modal-input-error">
						{{ modalConfig.inputErrorMessage || '输入内容无效' }}
					</view>
				</view>
			</view>
			
			<!-- 模态框底部按钮区 -->
			<view 
				v-if="modalConfig.showConfirmButton || modalConfig.showCancelButton" 
				class="cd-modal-footer"
			>
				<!-- 取消按钮 -->
				<view 
					v-if="modalConfig.showCancelButton"
					class="cd-modal-button cd-modal-cancel-button"
					:style="modalConfig.cancelStyle"
					:hover-class="modalConfig.cancelHoverClass || 'cd-modal-button-hover'"
					@click="handleCancel"
				>
					<text :style="{ color: modalConfig.cancelColor }">{{ modalConfig.cancelText }}</text>
				</view>
				
				<!-- 确认按钮 -->
				<view 
					v-if="modalConfig.showConfirmButton"
					class="cd-modal-button cd-modal-confirm-button"
					:style="modalConfig.confirmStyle"
					:hover-class="modalConfig.confirmHoverClass || 'cd-modal-button-hover'"
					:loading="modalConfig.asyncClose && loading"
					@click="handleConfirm"
				>
					<text :style="{ color: modalConfig.confirmColor }">{{ modalConfig.confirmText }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useModalStore } from '../../stores/modules/modal.js';

// 使用Pinia store
const modalStore = useModalStore();

// 模态框显示状态
const modalShow = ref(false);
// 加载状态
const loading = ref(false);
// 输入框值
const inputValue = ref('');
// 输入验证错误
const inputError = ref(false);
// 弹窗自定义样式
const customClass = computed(() => modalConfig.value?.customClass || '');
// 输入框值集合，用于富文本中的多个输入框
const inputValues = ref({});

// 监听键盘事件
const handleKeyDown = (event) => {
	if (event.key === 'Escape' && modalConfig.value?.closeOnPressEscape) {
		handleCancel();
	}
};

// 添加键盘事件监听
onMounted(() => {
	if (typeof window !== 'undefined') {
		window.addEventListener('keydown', handleKeyDown);
	}
});

// 移除键盘事件监听
onUnmounted(() => {
	if (typeof window !== 'undefined') {
		window.removeEventListener('keydown', handleKeyDown);
	}
});

// 模态框配置 - 使用计算属性从store获取当前模态框
const modalConfig = computed(() => {
	return modalStore.getCurrentModal || modalStore.defaultConfig;
});

// 检查内容中是否包含输入元素
const hasInputElements = computed(() => {
	if (!modalConfig.value || !modalConfig.value.richContent) return false;
	const content = modalConfig.value.richContent;
	return content.includes('<input') || content.includes('<textarea');
});

// 处理富文本内容
const processedRichContent = computed(() => {
	if (!modalConfig.value || !modalConfig.value.richContent) return '';
	
	// 将富文本内容中的uni-app组件标签转换为HTML标签
	let content = modalConfig.value.richContent;
	
	// 处理view标签
	content = content.replace(/<view/g, '<div').replace(/<\/view>/g, '</div>');
	
	// 处理text标签
	content = content.replace(/<text/g, '<span').replace(/<\/text>/g, '</span>');
	
	// 确保图片标签正确闭合
	content = content.replace(/<image([^>]*)>/g, '<img$1>');
	
	// 转换mode属性为style属性
	content = content.replace(/mode="aspectFit"/g, 'style="object-fit: contain;"');
	
	// 替换src路径确保正确加载图片
	content = content.replace(/src="\/static\//g, 'src="/static/');
	
	// 为输入元素添加name属性以便识别
	content = content.replace(/<input([^>]*)(placeholder="([^"]*)")/g, '<input$1$2 name="$3"');
	content = content.replace(/<textarea([^>]*)(placeholder="([^"]*)")/g, '<textarea$1$2 name="$3"');
	
	// 确保所有div正确关闭
	let tempDiv = document.createElement('div');
	tempDiv.innerHTML = content;
	content = tempDiv.innerHTML;
	
	return content;
});

// 监听输入变化
const handleInputChange = (event) => {
	if (event.target && (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA')) {
		const name = event.target.name || event.target.placeholder || `field_${Object.keys(inputValues.value).length}`;
		inputValues.value[name] = event.target.value;
	}
};

// 监听标准输入框输入
const handleTextInput = (event) => {
	inputValue.value = event.detail.value;
	inputError.value = false;
	
	// 如果有验证函数，则验证输入
	if (modalConfig.value?.inputValidator && typeof modalConfig.value.inputValidator === 'function') {
		inputError.value = !modalConfig.value.inputValidator(inputValue.value);
	}
};

// 监听模态框配置变化，重置输入值
watch(() => modalConfig.value, (newConfig) => {
	if (newConfig && newConfig.showInput) {
		inputValue.value = newConfig.inputValue || '';
		inputError.value = false;
	}
}, { deep: true });

// 处理遮罩层点击
const handleOverlayClick = () => {
	if (modalConfig.value?.maskCloseAble) {
		handleCancel();
	}
};

// 显示模态框
const showModal = (config = {}, confirmCallback = null, cancelCallback = null, key = '') => {
	// 重置输入值
	inputValue.value = '';
	inputError.value = false;
	inputValues.value = {};
	
	// 添加到store队列
	const modalId = modalStore.addModal(config, confirmCallback, cancelCallback, key);
	
	// 如果当前没有显示的弹窗，则显示
	if (!modalShow.value) {
		showNextModal();
	}
	
	return modalId;
};

// 显示队列中的下一个弹窗
const showNextModal = () => {
	// 从store获取下一个弹窗
	const nextModal = modalStore.showNextModal();
	
	// 如果有弹窗，则显示
	if (nextModal) {
		// 重置状态
		loading.value = false;
		inputValue.value = nextModal.inputValue || '';
		inputError.value = false;
		inputValues.value = {};
		
		// 显示弹窗
		nextTick(() => {
			modalShow.value = true;
		});
	} else {
		modalShow.value = false;
	}
};

// 处理确认按钮点击
const handleConfirm = () => {
	// 获取当前弹窗的回调
	const currentCallbacks = modalStore.getCurrentCallbacks;
	const currentModal = modalStore.getCurrentModal;
	
	// 如果有输入验证，先验证
	if (currentModal?.showInput && currentModal.inputValidator) {
		const isValid = currentModal.inputValidator(inputValue.value);
		if (!isValid) {
			inputError.value = true;
			return;
		}
	}
	
	// 如果是异步关闭，设置加载状态
	if (currentModal && currentModal.asyncClose) {
		loading.value = true;
	} else {
		// 否则直接关闭
		closeCurrentModal();
	}
	
	// 执行回调
	if (currentCallbacks?.confirm && typeof currentCallbacks.confirm === 'function') {
		// 如果是富文本中的输入框，传递所有输入值
		if (hasInputElements.value && Object.keys(inputValues.value).length > 0) {
			currentCallbacks.confirm(inputValues.value);
		} 
		// 如果是标准输入框，传递输入值
		else if (currentModal?.showInput) {
			currentCallbacks.confirm(inputValue.value);
		} 
		// 否则不传参数
		else {
			currentCallbacks.confirm();
		}
	}
};

// 处理取消按钮点击
const handleCancel = () => {
	// 获取当前弹窗的回调
	const currentCallbacks = modalStore.getCurrentCallbacks;
	
	// 关闭当前弹窗
	closeCurrentModal();
	
	// 执行回调
	if (currentCallbacks?.cancel && typeof currentCallbacks.cancel === 'function') {
		currentCallbacks.cancel();
	}
};

// 关闭当前弹窗并显示下一个
const closeCurrentModal = () => {
	// 隐藏当前弹窗
	modalShow.value = false;
	loading.value = false;
	
	// 从store中关闭当前弹窗
	modalStore.closeCurrentModal();
	
	// 显示下一个弹窗（如果有）
	setTimeout(() => {
		showNextModal();
	}, modalConfig.value?.animationDuration || 300); // 与动画持续时间一致
};

// 关闭指定ID的弹窗
const closeModalById = (idOrKey, skipCallback = false) => {
	// 判断是否是当前显示的弹窗
	const currentModal = modalStore.getCurrentModal;
	
	if (currentModal && (currentModal.id === idOrKey || currentModal.key === idOrKey)) {
		modalShow.value = false;
		loading.value = false;
	}
	
	// 从store中关闭指定弹窗
	const closed = modalStore.closeModalById(idOrKey, skipCallback);
	
	// 如果当前没有显示弹窗，尝试显示下一个
	if (!modalShow.value) {
		setTimeout(() => {
			showNextModal();
		}, modalConfig.value?.animationDuration || 300);
	}
	
	return closed;
};

// 清除加载状态(用于异步关闭)
const clearLoading = () => {
	loading.value = false;
};

// 完成异步操作并关闭当前弹窗
const finishAsync = () => {
	// 清除加载状态
	clearLoading();
	// 关闭当前弹窗
	closeCurrentModal();
};

// 关闭模态框
const closeModal = () => {
	closeCurrentModal();
};

// 清空所有弹窗
const clearAllModals = () => {
	// 使用store清空所有弹窗
	modalStore.clearAllModals();
	modalShow.value = false;
	loading.value = false;
};

// 监听事件
onMounted(() => {
	uni.$on('cd-page-modal:show', showModal);
	uni.$on('cd-page-modal:close', closeModal);
	uni.$on('cd-page-modal:close-by-id', closeModalById);
	uni.$on('cd-page-modal:clear-all', clearAllModals);
	uni.$on('cd-page-modal:finish-async', finishAsync);
});

// 移除事件监听
onUnmounted(() => {
	uni.$off('cd-page-modal:show', showModal);
	uni.$off('cd-page-modal:close', closeModal);
	uni.$off('cd-page-modal:close-by-id', closeModalById);
	uni.$off('cd-page-modal:clear-all', clearAllModals);
	uni.$off('cd-page-modal:finish-async', finishAsync);
});

// 暴露方法
defineExpose({
	showModal,
	closeModal,
	closeModalById,
	clearLoading,
	finishAsync,
	clearAllModals
});
</script>

<style>
/* 模态框容器 */
.cd-page-modal {
	position: relative;
}

/* 遮罩层 */
.cd-modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	transition: opacity 0.3s;
}

/* 全屏遮罩层 */
.cd-modal-overlay-fullscreen {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	width: 100vw;
	height: 100vh;
	z-index: 9999;
}

/* 模态框容器 */
.cd-modal-container {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: #fff;
	border-radius: 12rpx;
	overflow: hidden;
	box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.1);
	display: flex;
	flex-direction: column;
	max-height: 80vh;
}

/* 全屏模式 */
.cd-modal-fullscreen {
	width: 100% !important;
	height: 100% !important;
	top: 0 !important;
	left: 0 !important;
	transform: none !important;
	border-radius: 0 !important;
}

/* 模态框头部 */
.cd-modal-header {
	padding: 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1rpx solid #f2f2f2;
}

/* 模态框标题 */
.cd-modal-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

/* 关闭图标 */
.cd-modal-close-icon {
	font-size: 42rpx;
	color: #999;
	cursor: pointer;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 绝对定位关闭图标 */
.cd-modal-close-icon-absolute {
	position: absolute;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 40rpx;
	color: #999;
	cursor: pointer;
	z-index: 1;
	background-color: rgba(255, 255, 255, 0.8);
	border-radius: 50%;
}

/* 关闭图标位置 */
.cd-modal-close-icon-top-right {
	top: 10rpx;
	right: 10rpx;
}

.cd-modal-close-icon-top-left {
	top: 10rpx;
	left: 10rpx;
}

/* 模态框主体 */
.cd-modal-body {
	padding: 30rpx;
	max-height: 60vh;
	overflow-y: auto;
	flex: 1;
	box-sizing: border-box;
}

/* 模态框内容 */
.cd-modal-content {
	font-size: 28rpx;
	color: #666;
	line-height: 1.6;
	word-break: break-all;
}

/* 富文本内容 */
.cd-modal-rich-content {
	width: 100%;
	box-sizing: border-box;
}

/* 富文本包装器 */
.cd-modal-html-wrapper {
	width: 100%;
	box-sizing: border-box;
}

/* 输入区域 */
.cd-modal-input-area {
	margin-top: 20rpx;
}

/* 输入框 */
.cd-modal-input {
	width: 100%;
	height: 80rpx;
	border: 1rpx solid #dcdfe6;
	border-radius: 4rpx;
	padding: 0 20rpx;
	box-sizing: border-box;
	font-size: 28rpx;
	color: #333;
}

/* 文本域 */
.cd-modal-textarea {
	width: 100%;
	min-height: 160rpx;
	border: 1rpx solid #dcdfe6;
	border-radius: 4rpx;
	padding: 20rpx;
	box-sizing: border-box;
	font-size: 28rpx;
	color: #333;
	line-height: 1.5;
}

/* 输入错误提示 */
.cd-modal-input-error {
	color: #ff4d4f;
	font-size: 24rpx;
	margin-top: 10rpx;
}

/* 模态框底部 */
.cd-modal-footer {
	display: flex;
	border-top: 1rpx solid #f2f2f2;
}

/* 按钮基础样式 */
.cd-modal-button {
	flex: 1;
	height: 88rpx;
	line-height: 88rpx;
	text-align: center;
	font-size: 30rpx;
	position: relative;
}

/* 取消按钮 */
.cd-modal-cancel-button {
	border-right: 1rpx solid #f2f2f2;
}

/* 确认按钮 */
.cd-modal-confirm-button {
	color: #2979ff;
}

/* 按钮悬停效果 */
.cd-modal-button-hover {
	background-color: #f5f5f5;
}

/* 动画效果 */
@keyframes fadeIn {
	from { opacity: 0; }
	to { opacity: 1; }
}

@keyframes scaleIn {
	from { transform: translate(-50%, -50%) scale(0.7); opacity: 0; }
	to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

@keyframes slideTopIn {
	from { transform: translate(-50%, -80%); opacity: 0; }
	to { transform: translate(-50%, -50%); opacity: 1; }
}

@keyframes slideBottomIn {
	from { transform: translate(-50%, -20%); opacity: 0; }
	to { transform: translate(-50%, -50%); opacity: 1; }
}

.cd-modal-animation-fade {
	animation: fadeIn;
	animation-fill-mode: forwards;
}

.cd-modal-animation-scale {
	animation: scaleIn;
	animation-fill-mode: forwards;
}

.cd-modal-animation-slide-top {
	animation: slideTopIn;
	animation-fill-mode: forwards;
}

.cd-modal-animation-slide-bottom {
	animation: slideBottomIn;
	animation-fill-mode: forwards;
}

/* 样式化富文本中的输入框和文本域 */
.cd-modal-rich-content input {
	width: calc(100% - 16px);
	height: 36px;
	line-height: 36px;
	padding: 0 8px;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	margin-bottom: 10px;
	box-sizing: border-box;
}

.cd-modal-rich-content textarea {
	width: calc(100% - 16px);
	padding: 8px;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	box-sizing: border-box;
	min-height: 80px;
}

/* 样式化图片 */
.cd-modal-rich-content img {
	max-width: 100%;
	height: auto;
	display: block;
	margin: 0 auto;
}

/* 修复在富文本中的div样式 */
.cd-modal-rich-content div {
	box-sizing: border-box;
	max-width: 100%;
	word-break: break-word;
}
</style>
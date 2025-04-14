<template>
	<view class="demo-container">
		<view class="title-bar">
			<text class="title">弹窗组件示例</text>
		</view>

		<view class="button-group">
			<button @click="handleBasicModal" type="primary">基础模态框</button>
			<button @click="handleAsyncModal" type="primary">异步关闭模态框</button>
			<button @click="handleRichContentModal" type="primary">富文本模态框</button>
			<button @click="handleCustomStyleModal" type="primary">自定义样式模态框</button>
			<button @click="handleQueueModal" type="primary">模态框队列测试</button>
			<button @click="handleInputModal" type="primary">单行输入模态框</button>
			<button @click="handleTextareaModal" type="primary">多行输入模态框</button>
			<button @click="handleImageModal" type="primary">图片模态框</button>
			<button @click="handleAnimationModal" type="primary">动画效果模态框</button>
			<button @click="handleFullscreenModal" type="primary">全屏模态框</button>
			<button @click="handleDeduplicationModal" type="primary">弹窗去重测试</button>
			<button @click="handleUpdateModal" type="primary">动态更新弹窗</button>
			<button @click="handleComplexModal" type="primary">综合功能模态框</button>
			<button @click="handleSilentDelete" type="primary">静默删除弹窗测试</button>
			<button @click="handleEnhancedOverlay" type="primary">增强遮罩层测试</button>
		</view>
		
		<view class="status-bar" v-if="showStatus">
			<text class="status-title">队列状态:</text>
			<text>队列长度: {{ queueLength }}</text>
			<text>当前索引: {{ currentIndex }}</text>
			<text v-if="lastModalId">上一个添加的ID: {{ lastModalId }}</text>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useModalStore, addModal, closeModalById, updateModal, getModalQueueLength, getCurrentModalIndex } from '../../stores/modules/modal.js';

// 引入模态框状态存储
const modalStore = useModalStore();

// 状态显示
const showStatus = ref(false);
const queueLength = ref(0);
const currentIndex = ref(-1);
const lastModalId = ref('');

// 定时更新状态
const updateStatus = () => {
	queueLength.value = modalStore.getModalQueueLength;
	currentIndex.value = modalStore.getCurrentModalIndex;
};

// 组件挂载时设置状态更新定时器
onMounted(() => {
	setInterval(updateStatus, 500);
});

// 基础模态框
const handleBasicModal = () => {
	lastModalId.value = uni.$emit('cd-page-modal:show', {
		title: '基础模态框',
		content: '这是一个基础的模态框示例',
		showCancelButton: true,
		showCloseIcon: true
	}, () => {
		uni.showToast({ title: '点击了确认', icon: 'success' });
	}, () => {
		uni.showToast({ title: '点击了取消', icon: 'none' });
	});
	
	showStatus.value = true;
};

// 异步关闭模态框
const handleAsyncModal = () => {
	lastModalId.value = uni.$emit('cd-page-modal:show', {
		title: '异步关闭模态框',
		content: '这个模态框将在3秒后自动关闭',
		showCancelButton: true,
		asyncClose: true
	}, () => {
		uni.showToast({ title: '开始异步操作...', icon: 'loading' });
		
		setTimeout(() => {
			uni.showToast({ title: '异步操作完成', icon: 'success' });
			// 触发关闭事件
			uni.$emit('cd-page-modal:finish-async');
		}, 3000);
	});
	
	showStatus.value = true;
};

// 富文本内容模态框
const handleRichContentModal = () => {
	lastModalId.value = uni.$emit('cd-page-modal:show', {
		title: '富文本模态框',
		richContent: `
			<div style="padding: 20px;">
				<div style="color: #2979ff; font-size: 18px; margin-bottom: 10px;">
					这是一段<strong>富文本</strong>内容
				</div>
				<div style="color: #515a6e; line-height: 1.6;">
					支持<span style="color: #ed4014;">彩色</span>文本、
					<strong>粗体</strong>、<em>斜体</em>等样式，
					以及<span style="text-decoration: underline;">下划线</span>效果。
				</div>
				<div style="margin-top: 10px; padding: 10px; background-color: #f8f8f8; border-radius: 4px;">
					还可以添加各种样式的区块和边框。
				</div>
			</div>
		`,
		showCancelButton: true,
		width: 650
	});
	
	showStatus.value = true;
};

// 自定义样式模态框
const handleCustomStyleModal = () => {
	lastModalId.value = uni.$emit('cd-page-modal:show', {
		title: '自定义样式',
		content: '这是一个自定义样式的模态框',
		showCancelButton: true,
		confirmColor: '#19be6b',
		cancelColor: '#ff9900',
		width: 400,
		borderRadius: 8,
		titleStyle: { color: '#2979ff', fontWeight: 'bold', backgroundColor: '#f0f5ff', padding: '15px 20px' },
		contentStyle: { color: '#515a6e', padding: '30px 20px', fontSize: '16px' },
		cancelStyle: { backgroundColor: '#fff8f0' },
		confirmStyle: { backgroundColor: '#e6f7ef' },
		customClass: 'my-custom-modal'
	});
	
	showStatus.value = true;
};

// 模态框队列测试
const handleQueueModal = () => {
	// 连续触发三个模态框
	uni.$emit('cd-page-modal:show', {
		title: '第一个模态框',
		content: '这是队列中的第一个模态框',
		showCancelButton: true
	});
	
	uni.$emit('cd-page-modal:show', {
		title: '第二个模态框',
		content: '这是队列中的第二个模态框',
		showCancelButton: true
	});
	
	lastModalId.value = uni.$emit('cd-page-modal:show', {
		title: '第三个模态框',
		content: '这是队列中的第三个模态框',
		showCancelButton: true
	});
	
	showStatus.value = true;
};

// 单行输入框模态框
const handleInputModal = () => {
	lastModalId.value = uni.$emit('cd-page-modal:show', {
		title: '输入框示例',
		content: '请在下方输入你的姓名',
		showInput: true,
		inputType: 'text',
		inputPlaceholder: '请输入姓名',
		inputMaxlength: 20,
		inputValidator: (value) => value.length >= 2, // 简单验证至少2个字符
		inputErrorMessage: '姓名至少需要2个字符',
		showCancelButton: true
	}, (inputValue) => {
		uni.showToast({ title: `你好，${inputValue}`, icon: 'none' });
	});
	
	showStatus.value = true;
};

// 多行输入框模态框
const handleTextareaModal = () => {
	lastModalId.value = uni.$emit('cd-page-modal:show', {
		title: '多行输入框示例',
		content: '请输入你的反馈意见',
		showInput: true,
		inputType: 'textarea',
		inputPlaceholder: '请输入反馈意见，至少10个字符',
		inputMaxlength: 200,
		inputRows: 5,
		inputValidator: (value) => value.length >= 10, // 验证至少10个字符
		inputErrorMessage: '反馈意见至少需要10个字符',
		showCancelButton: true
	}, (inputValue) => {
		uni.showToast({ title: '感谢您的反馈！', icon: 'success' });
		console.log('反馈内容:', inputValue);
	});
	
	showStatus.value = true;
};

// 图片模态框
const handleImageModal = () => {
	// 确保图片路径正确
	const imagePath = '/static/1724429694897.jpg'; // 使用应用中已存在的图片
	
	lastModalId.value = uni.$emit('cd-page-modal:show', {
		title: '图片示例',
		richContent: `
			<div style="padding: 20px; text-align: center;">
				<img src="${imagePath}" style="width: 200px; height: 200px; object-fit: contain;" />
				<div style="margin-top: 10px; color: #606266;">示例图片展示</div>
			</div>
		`,
		showCancelButton: false,
		width: 550
	});
	
	showStatus.value = true;
};

// 动画效果模态框
const handleAnimationModal = () => {
	const animations = ['fade', 'scale', 'slide-top', 'slide-bottom'];
	let index = 0;
	
	const showNextAnimation = () => {
		if (index >= animations.length) return;
		
		const animation = animations[index];
		uni.$emit('cd-page-modal:show', {
			title: `动画效果: ${animation}`,
			content: `这是使用 ${animation} 动画效果的弹窗`,
			animationType: animation,
			animationDuration: 500,
			showCancelButton: true,
			confirmText: index < animations.length - 1 ? '下一个' : '完成'
		}, () => {
			index++;
			if (index < animations.length) {
				showNextAnimation();
			}
		});
	};
	
	showNextAnimation();
	showStatus.value = true;
};

// 全屏模态框
const handleFullscreenModal = () => {
	lastModalId.value = uni.$emit('cd-page-modal:show', {
		title: '全屏模态框',
		content: '这是一个全屏显示的模态框',
		fullscreen: true,
		showCancelButton: true,
		showCloseIcon: true
	});
	
	showStatus.value = true;
};

// 弹窗去重测试
const handleDeduplicationModal = () => {
	// 使用相同的key添加多个模态框
	const loginKey = 'login_required';
	
	// 第一次添加
	uni.$emit('cd-page-modal:show', {
		title: '登录提示',
		content: '您需要先登录才能继续操作',
		showCancelButton: true,
		confirmText: '去登录',
		cancelText: '取消'
	}, () => {
		uni.showToast({ title: '跳转到登录页面', icon: 'none' });
	}, null, loginKey);
	
	// 第二次添加（相同key，不会重复添加）
	uni.$emit('cd-page-modal:show', {
		title: '登录提示',
		content: '您需要先登录才能继续操作',
		showCancelButton: true,
		confirmText: '去登录',
		cancelText: '取消'
	}, () => {
		uni.showToast({ title: '跳转到登录页面', icon: 'none' });
	}, null, loginKey);
	
	// 第三次添加（相同key，不会重复添加）
	lastModalId.value = uni.$emit('cd-page-modal:show', {
		title: '登录提示',
		content: '您需要先登录才能继续操作',
		showCancelButton: true,
		confirmText: '去登录',
		cancelText: '取消'
	}, () => {
		uni.showToast({ title: '跳转到登录页面', icon: 'none' });
	}, null, loginKey);
	
	// 添加一个不同key的弹窗，将会在队列中
	uni.$emit('cd-page-modal:show', {
		title: '通知',
		content: '这是一个普通通知',
		showCancelButton: false
	}, null, null, 'notification');
	
	showStatus.value = true;
	
	setTimeout(() => {
		uni.showToast({ title: '尝试添加了3个相同key的弹窗，但队列中只有2个弹窗', icon: 'none', duration: 3000 });
	}, 500);
};

// 动态更新弹窗
const handleUpdateModal = () => {
	// 先添加一个基础弹窗
	const modalId = uni.$emit('cd-page-modal:show', {
		title: '初始弹窗',
		content: '这个弹窗的内容将在3秒后更新',
		showCancelButton: true,
		asyncClose: true
	});
	
	lastModalId.value = modalId;
	showStatus.value = true;
	
	// 3秒后更新弹窗内容
	setTimeout(() => {
		updateModal(modalId, {
			title: '已更新的弹窗',
			content: '弹窗内容已经更新，颜色和按钮也变化了',
			confirmColor: '#19be6b',
			cancelColor: '#ff9900',
			titleStyle: { backgroundColor: '#f0f9eb', color: '#67c23a' },
			contentStyle: { color: '#409eff' }
		});
		
		uni.showToast({ title: '弹窗已更新', icon: 'success' });
		
		// 再过3秒关闭弹窗
		setTimeout(() => {
			uni.$emit('cd-page-modal:finish-async');
		}, 3000);
	}, 3000);
};

// 综合功能模态框
const handleComplexModal = () => {
	// 确保图片路径正确
	const imagePath = '/static/1724429694897.jpg'; // 使用应用中已存在的图片
	
	lastModalId.value = uni.$emit('cd-page-modal:show', {
		title: '综合功能示例',
		richContent: `
			<div style="padding: 20px;">
				<div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
					<img src="${imagePath}" style="width: 60px; height: 60px; margin-right: 15px; border-radius: 30px; object-fit: cover;" />
					<div style="flex: 1;">
						<div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">请填写表单</div>
						<div style="color: #909399; font-size: 12px;">所有字段均为必填</div>
					</div>
				</div>
				
				<div style="margin-bottom: 15px;">
					<div style="margin-bottom: 5px; font-size: 14px; font-weight: bold;">标题</div>
					<input type="text" placeholder="请输入标题" style="border: 1px solid #dcdfe6; padding: 8px; border-radius: 4px; width: 100%; box-sizing: border-box;" />
				</div>
				
				<div style="margin-bottom: 15px;">
					<div style="margin-bottom: 5px; font-size: 14px; font-weight: bold;">描述</div>
					<textarea placeholder="请输入描述" style="border: 1px solid #dcdfe6; padding: 8px; border-radius: 4px; width: 100%; box-sizing: border-box; height: 80px;"></textarea>
				</div>
				
				<div style="margin-bottom: 15px;">
					<div style="margin-bottom: 5px; font-size: 14px; font-weight: bold;">截止日期</div>
					<input type="text" placeholder="请选择日期" value="2024-06-30" style="border: 1px solid #dcdfe6; padding: 8px; border-radius: 4px; width: 100%; box-sizing: border-box;" />
				</div>
				
				<div style="display: flex; justify-content: space-between; margin-top: 20px;">
					<span style="color: #f56c6c; font-size: 12px;">*所有字段为必填</span>
					<span style="color: #2979ff; font-size: 12px; cursor: pointer;">查看帮助</span>
				</div>
			</div>
		`,
		showCancelButton: true,
		confirmText: '提交',
		cancelText: '取消',
		width: 650,
		animationType: 'scale',
		borderRadius: 16,
		showCloseIcon: true,
		titleStyle: { 
			backgroundColor: '#ecf5ff', 
			color: '#409eff', 
			padding: '15px 20px',
			borderBottom: 'none'
		}
	}, (inputValues) => {
		console.log('表单输入:', inputValues);
		uni.showToast({ title: '表单已提交', icon: 'success' });
	});
	
	showStatus.value = true;
};

// 静默删除弹窗测试
const handleSilentDelete = () => {
	// 添加几个测试弹窗
	uni.$emit('cd-page-modal:show', {
		title: '弹窗 A',
		content: '这是弹窗 A'
	});
	
	const modalBId = uni.$emit('cd-page-modal:show', {
		title: '弹窗 B',
		content: '这是弹窗 B，将被静默删除'
	});
	
	const modalCId = uni.$emit('cd-page-modal:show', {
		title: '弹窗 C',
		content: '这是弹窗 C，将被静默删除'
	});
	
	lastModalId.value = uni.$emit('cd-page-modal:show', {
		title: '弹窗 D',
		content: '这是弹窗 D'
	});
	
	showStatus.value = true;
	
	// 显示当前队列长度
	setTimeout(() => {
		uni.showToast({ 
			title: `当前队列中有 ${modalStore.getModalQueueLength} 个弹窗`, 
			icon: 'none',
			duration: 2000
		});
		
		// 2秒后静默删除指定弹窗
		setTimeout(() => {
			closeModalById(modalBId, true);
			closeModalById(modalCId, true);
			
			// 更新提示
			setTimeout(() => {
				uni.showToast({ 
					title: `已删除2个弹窗，现在队列中有 ${modalStore.getModalQueueLength} 个弹窗`, 
					icon: 'none',
					duration: 3000
				});
			}, 500);
		}, 2000);
	}, 500);
};

// 添加增强遮罩层示例
const handleEnhancedOverlay = () => {
	lastModalId.value = uni.$emit('cd-page-modal:show', {
		title: '增强遮罩层示例',
		content: '这个模态框使用了增强的遮罩层效果，可以完全屏蔽后面的内容，并且支持模糊效果',
		showCancelButton: true,
		confirmText: '太棒了',
		cancelText: '返回',
		width: 600,
		// 增强遮罩层配置
		overlayOpacity: 0.8, // 更高的不透明度
		overlayBlur: 5, // 添加模糊效果
		overlayClass: 'custom-overlay', // 自定义类名
		showCloseIcon: true, // 显示关闭图标
		closeIconPosition: 'top-right', // 位置：top-right或top-left
		maskFullScreen: true, // 全屏遮罩
		// 自定义样式
		titleStyle: {
			backgroundColor: '#409eff',
			color: 'white',
			padding: '15px 20px'
		},
		contentStyle: {
			padding: '30px 20px',
			fontSize: '16px',
			lineHeight: '1.8'
		}
	});
	
	showStatus.value = true;
};
</script>

<style>
.demo-container {
	padding: 20px;
}

.title-bar {
	margin-bottom: 30px;
	padding-bottom: 15px;
	border-bottom: 1px solid #eee;
}

.title {
	font-size: 22px;
	font-weight: bold;
	color: #2979ff;
}

.button-group {
	display: flex;
	flex-direction: column;
	gap: 15px;
}

.button-group button {
	width: 100%;
	height: 45px;
	line-height: 45px;
	border-radius: 6px;
	font-size: 16px;
}

.status-bar {
	margin-top: 30px;
	padding: 15px;
	border: 1px solid #eee;
	border-radius: 6px;
	background-color: #f8f8f8;
}

.status-bar text {
	display: block;
	margin-bottom: 5px;
	color: #606266;
}

.status-title {
	font-weight: bold;
	margin-bottom: 10px !important;
	color: #2979ff !important;
}

/* 自定义模态框样式示例 */
.my-custom-modal .cd-modal-container {
	box-shadow: 0 0 20px rgba(25, 190, 107, 0.1);
}
</style>
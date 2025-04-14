/**
 * 模态框状态管理模块
 * 实现模态框队列管理、去重机制、回调函数存储和动态更新
 */
import { defineStore } from 'pinia'

// 默认配置
const _defaultConfig = {
	title: '提示',
	content: '',
	showTitle: true,
	showConfirmButton: true,
	showCancelButton: false,
	confirmText: '确定',
	cancelText: '取消',
	confirmColor: '#2979ff',
	cancelColor: '#606266',
	width: 600,
	borderRadius: 12,
	zoom: true,
	asyncClose: false,
	maskCloseAble: false,
	titleStyle: {},
	contentStyle: {},
	cancelStyle: {},
	confirmStyle: {},
	negativeTop: 0,
	blur: 0,
	useSlot: false,
	richContent: '',
	// 新增属性
	zIndex: 1000,
	overlay: true,
	overlayColor: 'rgba(0, 0, 0, 0.5)',
	closeOnPressEscape: false,
	appendToBody: true,
	fullscreen: false,
	lockScroll: true,
	customClass: '',
	// 输入框相关配置
	showInput: false,
	inputType: 'text', // text, textarea, password, number, email, tel
	inputValue: '',
	inputPlaceholder: '请输入',
	inputMaxlength: 100,
	inputRows: 4, // 多行文本时的行数
	inputValidator: null, // 输入验证函数
	inputErrorMessage: '', // 输入错误提示
	// 动画相关
	animationDuration: 300,
	animationType: 'fade', // fade, scale, slide-top, slide-bottom
	// 增强遮罩层相关配置
	overlayOpacity: 0.5, // 遮罩层不透明度 0-1
	overlayBlur: 0, // 遮罩层模糊效果，单位px
	overlayClass: '', // 遮罩层自定义类名
	showCloseIcon: false, // 是否显示关闭图标
	closeIconPosition: 'top-right', // 关闭图标位置: top-right, top-left
	maskFullScreen: false, // 遮罩层是否全屏显示（不受边距限制）
};

export const useModalStore = defineStore('modal', {
	state: () => ({
		modalQueue: [], // 模态框队列
		currentModalIndex: -1, // 当前显示的模态框索引
		modalCallbacks: [], // 模态框回调函数
		defaultConfig: _defaultConfig, // 默认配置
		isProcessing: false // 是否正在处理模态框，防止多次触发
	}),

	getters: {
		// 获取当前模态框配置
		getCurrentModal(state) {
			if (state.currentModalIndex === -1 || state.modalQueue.length === 0) {
				return null;
			}
			
			return state.modalQueue[state.currentModalIndex];
		},
		
		// 获取当前模态框回调
		getCurrentCallbacks(state) {
			if (state.currentModalIndex === -1 || state.modalCallbacks.length === 0) {
				return null;
			}
			
			return state.modalCallbacks[state.currentModalIndex];
		},
		
		// 获取模态框队列长度
		getModalQueueLength(state) {
			return state.modalQueue.length;
		},
		
		// 获取当前模态框索引
		getCurrentModalIndex(state) {
			return state.currentModalIndex;
		},
		
		// 获取模态框队列
		getModalQueue(state) {
			return state.modalQueue;
		},
		
		// 检查是否有待处理的模态框
		hasPendingModals(state) {
			return state.modalQueue.length > 0;
		}
	},

	actions: {
		/**
		 * 添加模态框到队列
		 * @param {Object} config 模态框配置
		 * @param {Function} confirmCallback 确认回调
		 * @param {Function} cancelCallback 取消回调
		 * @param {String} key 模态框唯一标识，用于去重
		 * @returns {String} 模态框ID，用于后续操作
		 */
		addModal(config = {}, confirmCallback = null, cancelCallback = null, key = '') {
			// 合并默认配置
			const modalConfig = { ...this.defaultConfig, ...config };
			
			// 如果有key，检查是否已存在相同key的模态框
			if (key) {
				const existingModalIndex = this.modalQueue.findIndex(modal => modal.key === key);
				
				if (existingModalIndex !== -1) {
					console.log('已存在相同key的模态框，不重复添加');
					// 返回已存在的模态框ID
					return this.modalQueue[existingModalIndex].id;
				}
			}
			
			// 生成唯一ID
			const modalId = `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			
			// 添加到队列
			this.modalQueue.push({
				...modalConfig,
				id: modalId,
				key: key || modalId, // 如果没有提供key，使用id作为key
				timestamp: Date.now(), // 添加时间戳，用于排序
				isVisible: false // 初始状态为不可见
			});
			
			// 存储回调
			this.modalCallbacks.push({
				confirm: confirmCallback,
				cancel: cancelCallback,
				id: modalId
			});
			
			// 如果当前没有显示的模态框，则尝试显示
			if (this.currentModalIndex === -1 && !this.isProcessing) {
				this.showNextModal();
			}
			
			return modalId;
		},

		/**
		 * 显示队列中的下一个模态框
		 * @param {Boolean} force 是否强制显示，忽略处理状态
		 * @returns {Object|null} 下一个模态框配置或null
		 */
		showNextModal(force = false) {
			// 如果正在处理且非强制，则返回
			if (this.isProcessing && !force) {
				return null;
			}
			
			// 设置处理状态
			this.isProcessing = true;
			
			// 如果队列为空，返回null
			if (this.modalQueue.length === 0) {
				this.currentModalIndex = -1;
				this.isProcessing = false;
				return null;
			}
			
			// 设置当前索引为队列中的第一个
			this.currentModalIndex = 0;
			
			// 标记为可见
			if (this.modalQueue[this.currentModalIndex]) {
				this.modalQueue[this.currentModalIndex].isVisible = true;
			}
			
			// 清除处理状态
			this.isProcessing = false;
			
			// 返回当前模态框配置
			return this.modalQueue[this.currentModalIndex];
		},

		/**
		 * 关闭当前模态框
		 * @param {Boolean} skipCallback 是否跳过回调函数
		 */
		closeCurrentModal(skipCallback = false) {
			if (this.currentModalIndex !== -1) {
				// 标记为处理中
				this.isProcessing = true;
				
				// 从队列和回调中移除当前模态框
				this.modalQueue.splice(this.currentModalIndex, 1);
				
				if (!skipCallback) {
					this.modalCallbacks.splice(this.currentModalIndex, 1);
				}
				
				// 重置当前索引
				this.currentModalIndex = -1;
				
				// 清除处理状态
				this.isProcessing = false;
				
				// 尝试显示下一个
				this.showNextModal();
			}
		},

		/**
		 * 根据ID或Key关闭指定模态框
		 * @param {String} idOrKey 模态框ID或Key
		 * @param {Boolean} skipCallback 是否跳过回调函数
		 * @returns {Boolean} 是否成功关闭
		 */
		closeModalById(idOrKey, skipCallback = false) {
			// 查找模态框索引
			const modalIndex = this.modalQueue.findIndex(
				modal => modal.id === idOrKey || modal.key === idOrKey
			);
			
			if (modalIndex === -1) {
				console.log(`未找到ID或Key为${idOrKey}的模态框`);
				return false;
			}
			
			// 如果是当前显示的模态框，使用closeCurrentModal关闭
			if (modalIndex === this.currentModalIndex) {
				this.closeCurrentModal(skipCallback);
				return true;
			}
			
			// 否则直接从队列中删除
			this.modalQueue.splice(modalIndex, 1);
			
			if (!skipCallback) {
				// 查找并删除对应的回调
				const callbackIndex = this.modalCallbacks.findIndex(
					callback => callback.id === idOrKey
				);
				
				if (callbackIndex !== -1) {
					this.modalCallbacks.splice(callbackIndex, 1);
				}
			}
			
			return true;
		},

		/**
		 * 清空所有模态框
		 */
		clearAllModals() {
			this.modalQueue = [];
			this.modalCallbacks = [];
			this.currentModalIndex = -1;
			this.isProcessing = false;
		},
		
		/**
		 * 更新模态框配置
		 * @param {String} idOrKey 模态框ID或Key
		 * @param {Object} config 要更新的配置
		 * @returns {Boolean} 是否成功更新
		 */
		updateModal(idOrKey, config = {}) {
			// 查找模态框索引
			const modalIndex = this.modalQueue.findIndex(
				modal => modal.id === idOrKey || modal.key === idOrKey
			);
			
			if (modalIndex === -1) {
				console.log(`未找到ID或Key为${idOrKey}的模态框`);
				return false;
			}
			
			// 更新配置
			this.modalQueue[modalIndex] = {
				...this.modalQueue[modalIndex],
				...config
			};
			
			return true;
		},
		
		/**
		 * 更新模态框回调函数
		 * @param {String} idOrKey 模态框ID或Key
		 * @param {Function} confirmCallback 确认回调
		 * @param {Function} cancelCallback 取消回调
		 * @returns {Boolean} 是否成功更新
		 */
		updateModalCallbacks(idOrKey, confirmCallback = null, cancelCallback = null) {
			// 查找回调索引
			const callbackIndex = this.modalCallbacks.findIndex(
				callback => callback.id === idOrKey
			);
			
			if (callbackIndex === -1) {
				console.log(`未找到ID为${idOrKey}的模态框回调`);
				return false;
			}
			
			// 更新回调
			if (confirmCallback !== null) {
				this.modalCallbacks[callbackIndex].confirm = confirmCallback;
			}
			
			if (cancelCallback !== null) {
				this.modalCallbacks[callbackIndex].cancel = cancelCallback;
			}
			
			return true;
		},
		
		/**
		 * 重新排序模态框队列
		 * @param {String} mode 排序模式: 'fifo'(先进先出) 或 'lifo'(后进先出)
		 */
		reorderModalQueue(mode = 'lifo') {
			if (this.modalQueue.length <= 1) return;
			
			// 如果有当前显示的模态框，不进行排序
			if (this.currentModalIndex !== -1) return;
			
			if (mode === 'fifo') {
				// 按时间戳升序排序 (先进先出)
				this.modalQueue.sort((a, b) => a.timestamp - b.timestamp);
				this.modalCallbacks.sort((a, b) => {
					const modalA = this.modalQueue.find(modal => modal.id === a.id);
					const modalB = this.modalQueue.find(modal => modal.id === b.id);
					return (modalA?.timestamp || 0) - (modalB?.timestamp || 0);
				});
			} else if (mode === 'lifo') {
				// 按时间戳降序排序 (后进先出)
				this.modalQueue.sort((a, b) => b.timestamp - a.timestamp);
				this.modalCallbacks.sort((a, b) => {
					const modalA = this.modalQueue.find(modal => modal.id === a.id);
					const modalB = this.modalQueue.find(modal => modal.id === b.id);
					return (modalB?.timestamp || 0) - (modalA?.timestamp || 0);
				});
			}
		}
	}
});

// 为兼容旧代码，导出相同的函数接口
export const defaultConfig = _defaultConfig;

export const addModal = (config, confirmCallback, cancelCallback, key) => {
	return useModalStore().addModal(config, confirmCallback, cancelCallback, key);
};

export const showNextModal = () => {
	return useModalStore().showNextModal();
};

export const getCurrentModal = () => {
	return useModalStore().getCurrentModal;
};

export const getCurrentCallbacks = () => {
	return useModalStore().getCurrentCallbacks;
};

export const closeCurrentModal = (skipCallback) => {
	useModalStore().closeCurrentModal(skipCallback);
};

export const closeModalById = (idOrKey, skipCallback) => {
	return useModalStore().closeModalById(idOrKey, skipCallback);
};

export const clearAllModals = () => {
	useModalStore().clearAllModals();
};

export const updateModal = (idOrKey, config) => {
	return useModalStore().updateModal(idOrKey, config);
};

export const updateModalCallbacks = (idOrKey, confirmCallback, cancelCallback) => {
	return useModalStore().updateModalCallbacks(idOrKey, confirmCallback, cancelCallback);
};

export const reorderModalQueue = (mode) => {
	useModalStore().reorderModalQueue(mode);
};

export const getModalQueueLength = () => {
	return useModalStore().getModalQueueLength;
};

export const getCurrentModalIndex = () => {
	return useModalStore().getCurrentModalIndex;
};

export const getModalQueue = () => {
	return useModalStore().getModalQueue;
};

export const hasPendingModals = () => {
	return useModalStore().hasPendingModals;
};
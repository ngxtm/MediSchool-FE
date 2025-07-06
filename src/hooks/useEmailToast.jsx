import { useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'

const THEMES = {
	teal: {
		primary: 'text-teal-600',
		bg: 'bg-teal-600',
		hover: 'hover:bg-teal-700'
	},
	blue: {
		primary: 'text-blue-600',
		bg: 'bg-blue-600',
		hover: 'hover:bg-blue-700'
	}
}

export const useEmailToast = (theme = 'teal') => {
	const [sendingStates, setSendingStates] = useState({})

	const themeConfig = THEMES[theme] || THEMES.teal

	const getThemeClass = type => {
		switch (type) {
			case 'text':
				return themeConfig.primary
			case 'bg':
				return themeConfig.bg
			default:
				return themeConfig.primary
		}
	}

	const calculateEmailTiming = emailCount => {
		const firstEmailTime = 4000
		const subsequentEmailTime = 2500
		return {
			intervals: [
				{ time: firstEmailTime, progress: emailCount > 0 ? (1 / emailCount) * 80 : 80 },
				...Array.from({ length: emailCount - 1 }, (_, i) => ({
					time: subsequentEmailTime,
					progress: ((i + 2) / emailCount) * 80
				}))
			]
		}
	}

	const animateProgress = (toastId, emailCount, onComplete) => {
		if (emailCount <= 0) return

		const { intervals } = calculateEmailTiming(emailCount)
		let currentProgress = 0
		let currentInterval = 0
		let isCompleted = false

		const updateProgress = () => {
			if (isCompleted) return

			toast.update(toastId, {
				render: (
					<div className="flex items-center space-x-3">
						<Mail className={`w-5 h-5 animate-pulse ${getThemeClass('text')}`} />
						<div className="flex-1">
							<div className="font-medium text-gray-900">Đang gửi email...</div>
							<div className="text-sm text-gray-600">
								{emailCount > 0 ? `Gửi đến ${emailCount} phụ huynh` : 'Đang xử lý thông báo'}
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2 mt-2">
								<div
									className={`${getThemeClass('bg')} h-2 rounded-full transition-all duration-300`}
									style={{ width: `${currentProgress}%` }}
								></div>
							</div>
							<div className="text-xs text-gray-500 mt-1">
								{currentProgress < 90
									? `Đang gửi email ${Math.min(currentInterval + 1, emailCount)}/${emailCount}...`
									: 'Hoàn tất gửi email...'}
							</div>
						</div>
					</div>
				)
			})

			if (currentInterval < intervals.length) {
				const interval = intervals[currentInterval]
				const targetProgress = Math.min(interval.progress, 90)

				const progressStep = (targetProgress - currentProgress) / (interval.time / 100)

				const animateStep = () => {
					if (isCompleted) return

					currentProgress = Math.min(currentProgress + progressStep, targetProgress)

					if (currentProgress < targetProgress) {
						setTimeout(animateStep, 100)
					} else {
						currentInterval++
						if (currentInterval < intervals.length) {
							setTimeout(updateProgress, 200)
						} else {
							currentProgress = 90
						}
					}
				}

				animateStep()
			}
		}

		updateProgress()

		return {
			complete: () => {
				isCompleted = true
				currentProgress = 100

				toast.update(toastId, {
					render: (
						<div className="flex items-center space-x-3">
							<CheckCircle className={`w-5 h-5 ${getThemeClass('text')}`} />
							<div className="flex-1">
								<div className="font-medium text-gray-900">Hoàn tất gửi email!</div>
								<div className="text-sm text-gray-600">Đang xử lý kết quả...</div>
								<div className="w-full bg-gray-200 rounded-full h-2 mt-2">
									<div
										className={`${getThemeClass(
											'bg'
										)} h-2 rounded-full transition-all duration-500`}
										style={{ width: '100%' }}
									></div>
								</div>
							</div>
						</div>
					)
				})

				onComplete?.()
			}
		}
	}

	const sendEmailWithProgress = async (key, totalCount, apiCall) => {
		if (isSending(key)) {
			return
		}

		setSendingStates(prev => ({ ...prev, [key]: true }))

		const progressToastId = `email-progress-${key}`

		toast.info(
			<div className="flex items-center space-x-3">
				<Mail className={`w-5 h-5 animate-pulse ${getThemeClass('text')}`} />
				<div className="flex-1">
					<div className="font-medium text-gray-900">Đang gửi email...</div>
					<div className="text-sm text-gray-600">
						{totalCount > 0 ? `Gửi đến ${totalCount} phụ huynh` : 'Đang xử lý thông báo'}
					</div>
					<div className="w-full bg-gray-200 rounded-full h-2 mt-2">
						<div
							className={`${getThemeClass('bg')} h-2 rounded-full transition-all duration-300`}
							style={{ width: '0%' }}
						></div>
					</div>
					<div className="text-xs text-gray-500 mt-1">Chuẩn bị gửi email...</div>
				</div>
			</div>,
			{
				toastId: progressToastId,
				position: 'bottom-center',
				autoClose: false,
				closeButton: false,
				hideProgressBar: true
			}
		)

		const progressController = animateProgress(progressToastId, totalCount)

		try {
			console.log('Starting API call...')
			const response = await apiCall()
			console.log('API call completed successfully:', response)

			progressController?.complete()

			setTimeout(() => {
				const actualCount =
					response.data?.actualCount ||
					response.data?.totalParentsNotified ||
					response.data?.totalEmailsSent ||
					totalCount

				toast.dismiss(progressToastId)

				toast.success(
					<div className="flex items-center space-x-3">
						<CheckCircle className={`w-5 h-5 ${getThemeClass('text')}`} />
						<div>
							<div className="font-medium text-gray-900">Gửi email thành công!</div>
							<div className="text-sm text-gray-600">Đã gửi đến {actualCount} phụ huynh</div>
						</div>
					</div>,
					{
						position: 'bottom-center',
						autoClose: 4000,
						hideProgressBar: true
					}
				)
			}, 800)
		} catch (error) {
			console.error('=== EMAIL SENDING ERROR ===')
			console.error('Error details:', error)
			console.error('Error response:', error.response)
			console.error('Error message:', error.message)

			toast.dismiss(progressToastId)

			toast.error(
				<div className="flex items-center space-x-3">
					<AlertCircle className="w-5 h-5 text-red-500" />
					<div>
						<div className="font-medium text-gray-900">Lỗi khi gửi email</div>
						<div className="text-sm text-gray-600">
							{error.response?.data?.message || error.message || 'Không thể gửi thông báo cho phụ huynh'}
						</div>
					</div>
				</div>,
				{
					position: 'bottom-center',
					autoClose: 5000,
					hideProgressBar: true
				}
			)
		} finally {
			setSendingStates(prev => ({ ...prev, [key]: false }))
			console.log('Email sending process completed for key:', key)
		}
	}

	const isSending = useCallback(
		key => {
			return sendingStates[key] || false
		},
		[sendingStates]
	)

	return {
		sendEmailWithProgress,
		isSending
	}
}

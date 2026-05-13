'use client'

import { CULTURE_TYPES } from '@/lib/ocai-data'
import { useLocale } from '@/lib/i18n/context'

export function OCAIHelpPanel() {
  const { t } = useLocale()

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('ocaiHelp.title')}</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">{t('ocaiHelp.aboutTitle')}</h4>
          <p className="text-sm text-gray-600">{t('ocaiHelp.aboutText')}</p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">{t('ocaiHelp.dimensionsTitle')}</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>{t('ocaiHelp.dim1Title')}</strong> {t('ocaiHelp.dim1Desc')}</li>
            <li>• <strong>{t('ocaiHelp.dim2Title')}</strong> {t('ocaiHelp.dim2Desc')}</li>
            <li>• <strong>{t('ocaiHelp.dim3Title')}</strong> {t('ocaiHelp.dim3Desc')}</li>
            <li>• <strong>{t('ocaiHelp.dim4Title')}</strong> {t('ocaiHelp.dim4Desc')}</li>
            <li>• <strong>{t('ocaiHelp.dim5Title')}</strong> {t('ocaiHelp.dim5Desc')}</li>
            <li>• <strong>{t('ocaiHelp.dim6Title')}</strong> {t('ocaiHelp.dim6Desc')}</li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">{t('ocaiHelp.culturesTitle')}</h4>
          <div className="space-y-3">
            {Object.entries(CULTURE_TYPES).map(([key, culture]) => (
              <div key={key} className="border-l-4 p-3" style={{ borderLeftColor: culture.color }}>
                <h5 className="font-medium text-gray-900" style={{ color: culture.color }}>
                  {t(`ocaiHelp.culture${key.charAt(0).toUpperCase() + key.slice(1)}Name`)}
                </h5>
                <p className="text-xs text-gray-600 mt-1">{t(`ocaiHelp.culture${key.charAt(0).toUpperCase() + key.slice(1)}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">{t('ocaiHelp.howToTitle')}</h4>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>{t('ocaiHelp.howTo1')}</li>
            <li>{t('ocaiHelp.howTo2')}</li>
            <li>{t('ocaiHelp.howTo3')}</li>
            <li>{t('ocaiHelp.howTo4')}</li>
            <li>{t('ocaiHelp.howTo5')}</li>
          </ol>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <h4 className="font-medium text-yellow-800 mb-1">{t('ocaiHelp.tipsTitle')}</h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• {t('ocaiHelp.tip1')}</li>
            <li>• {t('ocaiHelp.tip2')}</li>
            <li>• {t('ocaiHelp.tip3')}</li>
            <li>• {t('ocaiHelp.tip4')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

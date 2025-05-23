import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import { InputField, Dropdown } from '../../../features/register/subcomponents'; // Assuming path
import Icon from '../../../components/common/Icon'; // Assuming path
import { calculateMargin, calculateTax } from '../utils/addProductUtils'; // Assuming path
import { useTaxRates } from '../../../contexts/ProductDataContext'; // TanStack Query hooks
import scriptLines from '../utils/script_lines'; // Added import


const Step4_Pricing_Actual = memo(({ formData, updateField, errors }) => {
    const { data: taxRatesData, isLoading: isLoadingTaxRates, error: taxRatesError } = useTaxRates();
    const taxRates = taxRatesData || [];
    
    const currencySymbol = scriptLines.currencySymbolDefault || '€'; // Use localized currency symbol

    const estimatedCostFromIngredients = parseFloat(formData.estimatedCostFromIngredients) || 0;
    const laborAndOverheadCost = parseFloat(formData.laborAndOverheadCost) || 0;
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    
    const selectedTaxRateObject = useMemo(() => 
        taxRates.find(tr => tr.id === formData.taxRateId),
    [formData.taxRateId, taxRates]);
    
    const currentTaxRatePercentage = selectedTaxRateObject ? parseFloat(selectedTaxRateObject.rate_percentage) : null;

    const totalCalculatedCost = useMemo(() => {
        return estimatedCostFromIngredients + laborAndOverheadCost;
    }, [estimatedCostFromIngredients, laborAndOverheadCost]);

    const marginInfo = useMemo(() => {
        return calculateMargin(sellingPrice, totalCalculatedCost);
    }, [sellingPrice, totalCalculatedCost]);

    const taxInfo = useMemo(() => {
        return calculateTax(sellingPrice, currentTaxRatePercentage);
    }, [sellingPrice, currentTaxRatePercentage]);

    let marginColorClass = 'text-neutral-600 dark:text-neutral-300';
    if (marginInfo.percentage !== null) {
        if (marginInfo.percentage >= 50) marginColorClass = 'text-green-500 dark:text-green-400';
        else if (marginInfo.percentage >= 20) marginColorClass = 'text-yellow-500 dark:text-yellow-400';
        else if (marginInfo.percentage >= 0) marginColorClass = 'text-orange-500 dark:text-orange-400';
        else marginColorClass = 'text-red-500 dark:text-red-400';
    }

    const taxRateOptionsForDropdown = useMemo(() => [
        { value: null, label: scriptLines.step4TaxRateNoTaxOption || 'No Tax / Tax Included' },
        ...(taxRates.map(rate => ({ value: rate.id, label: `${rate.name} (${rate.rate_percentage}%)` })))
    ], [taxRates]);


    if (isLoadingTaxRates) {
        return <div className="py-10 text-center">{scriptLines.step4LoadingTaxRates || "Loading tax rates..."}</div>;
    }
    if (taxRatesError) {
        return <div className="py-10 text-center text-red-500">
            {(scriptLines.step4ErrorLoadingTaxRatesPattern || "Error loading tax rates: {errorMessage}")
                .replace('{errorMessage}', taxRatesError.message)}
        </div>;
    }

    return (
        <motion.div
            layout className="space-y-8 py-2"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
        >
            <div>
                <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
                    {scriptLines.step4MainTitle || "Pricing Configuration"}
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {scriptLines.step4MainSubtitle || "Set your product's price, considering costs and desired profit margin."}
                </p>
            </div>

            <div className="space-y-4 p-5 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg shadow">
                <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-200 border-b pb-2 mb-4 dark:border-neutral-600">
                    {scriptLines.step4CostBreakdownTitle || "Cost Breakdown"}
                </h3>
                {formData.productType === 'made_in_house' && (
                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">
                            {scriptLines.step4EstCostIngredientsLabel || "Estimated Cost from Ingredients:"}
                        </span>
                        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                            {currencySymbol}{estimatedCostFromIngredients.toFixed(2)}
                        </span>
                    </div>
                )}
                <div className='flex h-15 items-end w-full'>
                    <InputField
                        label={formData.productType === 'made_in_house' 
                            ? (scriptLines.step4LaborOverheadLabelPattern || "Labor, Packaging & Overheads ({currencySymbol})").replace('{currencySymbol}', currencySymbol)
                            : (scriptLines.step4PurchaseCostLabelPattern || "Purchase Cost ({currencySymbol})").replace('{currencySymbol}', currencySymbol)
                        }
                        name="laborAndOverheadCost" className="w-full" type="number"
                        value={formData.laborAndOverheadCost === null ? '' : formData.laborAndOverheadCost}
                        onChange={(e) => updateField('laborAndOverheadCost', e.target.value === '' ? null : parseFloat(e.target.value))}
                        error={errors?.laborAndOverheadCost} placeholder="0.00" min="0" step="0.01"
                        helptext={formData.productType === 'made_in_house' 
                            ? scriptLines.step4LaborOverheadHelpText || "Additional costs beyond raw ingredients." 
                            : scriptLines.step4PurchaseCostHelpText || "Your cost to acquire this resold item."
                        }
                    />
                </div>
                <div className="flex justify-between items-center pt-3 mt-3 border-t dark:border-neutral-600">
                    <span className="text-md font-semibold text-neutral-700 dark:text-neutral-200">
                        {scriptLines.step4TotalCalculatedCostLabel || "Total Calculated Cost:"}
                    </span>
                    <span className="text-md font-bold text-rose-600 dark:text-rose-400">
                        {currencySymbol}{totalCalculatedCost.toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="space-y-4 p-5 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg shadow">
                <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-200 border-b pb-2 mb-4 dark:border-neutral-600">
                    {scriptLines.step4SellingPriceProfitTitle || "Selling Price & Profit"}
                </h3>
                <div className='flex h-15 items-end'>
                    <InputField
                        label={(scriptLines.step4SellingPriceLabelPattern || "Your Selling Price ({currencySymbol}) (Excluding Tax)").replace('{currencySymbol}', currencySymbol)}
                        name="sellingPrice" type="number"
                        value={formData.sellingPrice === null ? '' : formData.sellingPrice}
                        onChange={(e) => updateField('sellingPrice', e.target.value === '' ? null : parseFloat(e.target.value))}
                        error={errors?.sellingPrice} placeholder="0.00" min="0" step="0.01" required
                        className="text-lg w-full font-semibold"
                    />
                </div>
                {totalCalculatedCost > sellingPrice && sellingPrice > 0 && (
                    <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-md">
                        <Icon name="warning" className="w-6 h-6 mr-1.5 flex-shrink-0" />
                        {scriptLines.step4WarningPriceBelowCost || "Selling price is below the total calculated cost. This will result in a loss."}
                    </div>
                )}
                <div className="pt-2">
                    <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                        {scriptLines.step4CalcProfitMarginLabel || "Calculated Profit Margin:"}
                    </div>
                    <div className={`text-3xl font-bold ${marginColorClass}`}>
                        {marginInfo.percentage !== null ? `${marginInfo.percentage.toFixed(1)}%` : (scriptLines.step4NotApplicable || 'N/A')}
                    </div>
                    {marginInfo.profit !== null && (
                        <div className="text-xs text-neutral-500 dark:text-neutral-450">
                            {(scriptLines.step4ProfitPerUnitLabelPattern || "Profit per unit (before tax): {currencySymbol}{profitAmount}")
                                .replace('{currencySymbol}', currencySymbol)
                                .replace('{profitAmount}', marginInfo.profit.toFixed(2))}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4 p-5 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg shadow">
                <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-200 border-b pb-2 mb-4 dark:border-neutral-600">
                    {scriptLines.step4TaxationTitle || "Taxation"}
                </h3>
                <div className='flex h-15 items-end w-full'>
                    <Dropdown
                        label={scriptLines.step4TaxRateLabel || "Tax Rate (Applied to Selling Price)"}
                        className="w-full" name="taxRateId"
                        options={taxRateOptionsForDropdown}
                        value={formData.taxRateId}
                        onChange={(value) => updateField('taxRateId', value === '' ? null : value)}
                        error={errors?.taxRateId}
                        errorClassName="absolute top-0 left-0"
                    />
                </div>
                {currentTaxRatePercentage !== null && sellingPrice > 0 && (
                    <div className="space-y-1 pt-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-neutral-600 dark:text-neutral-300">
                                {(scriptLines.step4TaxAmountLabelPattern || "Tax Amount ({taxRate}%):").replace('{taxRate}', currentTaxRatePercentage)}
                            </span>
                            <span className="font-medium text-neutral-700 dark:text-neutral-200">
                                {currencySymbol}{taxInfo.taxAmount.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-md pt-1 border-t dark:border-neutral-600 mt-2">
                            <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                                {scriptLines.step4FinalPriceLabel || "Final Selling Price (Incl. Tax):"}
                            </span>
                            <span className="font-bold text-xl text-green-600 dark:text-green-400">
                                {currencySymbol}{taxInfo.sellingPriceInclTax.toFixed(2)}
                            </span>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-5 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg shadow">
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={!!formData.isTemplateCandidate}
                        onChange={(e) => updateField('isTemplateCandidate', e.target.checked)}
                        className="h-5 w-5 rounded border-neutral-300 text-rose-600 focus:ring-rose-500 dark:border-neutral-600 dark:bg-neutral-700 dark:checked:bg-rose-500 dark:checked:border-rose-500"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-200">
                        {scriptLines.step4SaveAsTemplateLabel || "Use this product as a template for future creations"}
                    </span>
                </label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 pl-8">
                    {scriptLines.step4SaveAsTemplateHelpText || "If checked, this product's details will pre-fill the form next time you add a new product. Only one product can be the active template per business."}
                </p>
            </div>
        </motion.div>
    );
});

Step4_Pricing_Actual.propTypes = {
    formData: PropTypes.object.isRequired,
    updateField: PropTypes.func.isRequired,
    errors: PropTypes.object,
};

export default Step4_Pricing_Actual;

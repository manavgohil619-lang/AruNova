import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { CropProfileModel } from '../types';
import { telemetryService } from '../services/telemetryService';
import { useTelemetryContext } from '../context/TelemetryContext';
import { Wheat, Check, Save, RotateCcw, AlertCircle } from 'lucide-react';

export const CropProfile: React.FC = () => {
  const { data, refresh } = useTelemetryContext();
  const [crops, setCrops] = useState<CropProfileModel[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string>('leafy_veg');
  const [editingCrop, setEditingCrop] = useState<CropProfileModel | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      const list = await telemetryService.getCrops();
      setCrops(list);
      const activeId = data?.device.activeCropId || 'leafy_veg';
      setSelectedCropId(activeId);
      const found = list.find((c) => c.id === activeId) || list[0];
      if (found) setEditingCrop({ ...found });
    };
    load();
  }, [data?.device.activeCropId]);

  const handleSelect = async (crop: CropProfileModel) => {
    setSelectedCropId(crop.id);
    setEditingCrop({ ...crop });
    await telemetryService.selectCrop(crop.id);
    refresh();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCrop) return;

    await telemetryService.saveCrop(editingCrop);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);

    const updated = await telemetryService.getCrops();
    setCrops(updated);
    refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Horticultural Crop Profiles & Thresholds"
        subtitle="Configurable psychrometric preservation targets tailored for North Eastern Region (NER) produce"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Crop Selection List */}
        <div className="space-y-3">
          <SectionCard
            title="SELECT COMMODITY PROFILE"
            subtitle="Click to switch active storage set points"
          >
            <div className="space-y-2">
              {crops.map((crop) => {
                const isActive = crop.id === selectedCropId;
                return (
                  <button
                    key={crop.id}
                    onClick={() => handleSelect(crop)}
                    className={`w-full text-left p-3 rounded-md border transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-[#EBF4FA] border-[#1769AA] text-[#1769AA] shadow-xs'
                        : 'bg-white border-[#E4E7EC] text-[#344054] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${isActive ? 'bg-[#1769AA] text-white' : 'bg-[#F2F4F7] text-[#667085]'}`}>
                        <Wheat className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{crop.cropName}</div>
                        <div className="text-[11px] text-[#667085]">
                          {crop.targetTemperature}°C • {crop.targetHumidity}% RH
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <span className="p-1 rounded-full bg-[#1769AA] text-white">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <div className="p-4 rounded-lg bg-[#FDF9EE] border border-[#F9DBAF] text-xs text-[#B54708]">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <AlertCircle className="w-4 h-4 text-[#E3A72F]" />
              <span>Agronomic Validation Notice</span>
            </div>
            Storage conditions must be validated for the selected crop before real-world deployment. Different varieties and post-harvest handling methods affect respiration rates and chilling vulnerability.
          </div>
        </div>

        {/* Right: Parameter Editor Form */}
        <div className="lg:col-span-2">
          {editingCrop && (
            <SectionCard
              title={`CONFIGURE PROFILE: ${editingCrop.cropName.toUpperCase()}`}
              subtitle="Adjust thermal and humidity targets and automated trip thresholds"
            >
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#344054] mb-1">
                      Commodity Name
                    </label>
                    <input
                      type="text"
                      value={editingCrop.cropName}
                      onChange={(e) => setEditingCrop({ ...editingCrop, cropName: e.target.value })}
                      className="w-full px-3 py-2 border border-[#D0D5DD] rounded-md text-xs text-[#17212B] focus:outline-none focus:border-[#1769AA]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#344054] mb-1">
                      Nominal Shelf Life (Days)
                    </label>
                    <input
                      type="number"
                      value={editingCrop.storageDurationDays}
                      onChange={(e) => setEditingCrop({ ...editingCrop, storageDurationDays: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#D0D5DD] rounded-md text-xs text-[#17212B] focus:outline-none focus:border-[#1769AA]"
                      min={1}
                      max={180}
                      required
                    />
                  </div>
                </div>

                {/* Temperature Settings */}
                <div className="p-4 rounded-lg border border-[#E4E7EC] bg-[#F8F9FA] space-y-3">
                  <div className="text-xs font-bold text-[#1769AA] uppercase tracking-wider">
                    THERMAL SETTINGS (°C)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#667085] mb-1">
                        Minimum Permissible (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingCrop.temperatureMin}
                        onChange={(e) => setEditingCrop({ ...editingCrop, temperatureMin: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-[#D0D5DD] rounded-md text-xs bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#667085] mb-1">
                        Target Set Point (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingCrop.targetTemperature}
                        onChange={(e) => setEditingCrop({ ...editingCrop, targetTemperature: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-[#1769AA] rounded-md text-xs bg-white font-bold text-[#1769AA]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#667085] mb-1">
                        Maximum Threshold (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingCrop.temperatureMax}
                        onChange={(e) => setEditingCrop({ ...editingCrop, temperatureMax: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-[#D0D5DD] rounded-md text-xs bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Humidity Settings */}
                <div className="p-4 rounded-lg border border-[#E4E7EC] bg-[#F8F9FA] space-y-3">
                  <div className="text-xs font-bold text-[#1597B8] uppercase tracking-wider">
                    HUMIDITY SETTINGS (% RH)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#667085] mb-1">
                        Minimum Permissible (% RH)
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={editingCrop.humidityMin}
                        onChange={(e) => setEditingCrop({ ...editingCrop, humidityMin: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-[#D0D5DD] rounded-md text-xs bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#667085] mb-1">
                        Target Humidity Set Point (% RH)
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={editingCrop.targetHumidity}
                        onChange={(e) => setEditingCrop({ ...editingCrop, targetHumidity: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-[#1597B8] rounded-md text-xs bg-white font-bold text-[#1597B8]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#667085] mb-1">
                        Maximum Threshold (% RH)
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={editingCrop.humidityMax}
                        onChange={(e) => setEditingCrop({ ...editingCrop, humidityMax: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-[#D0D5DD] rounded-md text-xs bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-[#344054] mb-1">
                    Commodity Storage Notes
                  </label>
                  <textarea
                    rows={2}
                    value={editingCrop.notes}
                    onChange={(e) => setEditingCrop({ ...editingCrop, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D0D5DD] rounded-md text-xs text-[#17212B] focus:outline-none focus:border-[#1769AA]"
                    placeholder="Specific agronomic instructions, pre-cooling requirements, ethylene sensitivity..."
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-[#F2F4F7]">
                  {saveSuccess ? (
                    <span className="text-xs font-semibold text-[#2E9B67] flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      <span>Profile saved & thresholds applied to controller!</span>
                    </span>
                  ) : <span />}

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1769AA] hover:bg-[#2F80C0] text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save & Apply Set Points</span>
                    </button>
                  </div>
                </div>
              </form>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
};

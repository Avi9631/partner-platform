import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Loader2, MapPin, CheckCircle2, Navigation, AlertCircle } from "lucide-react";

const Step3Location = ({ formData, errors, locationLoading, captureLocation }) => {
  return (
    <div className="space-y-6">
      {/* <div className="text-center mb-6">
        <div className="relative inline-block">
          <MapPin className="w-16 h-16 mx-auto text-orange-600 mb-4" />
          <div className="absolute -top-1 -right-1 bg-orange-100 rounded-full p-1.5">
            <Navigation className="w-4 h-4 text-orange-600" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900">Capture Your Location</h3>
        <p className="text-sm text-gray-600">
          We need your location to provide better services
        </p>
        <Badge variant="secondary" className="mt-3">
          <span className="text-xs">GPS required</span>
        </Badge>
      </div> */}

      {formData.location.latitude ? (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 rounded-full p-3 shrink-0">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-semibold text-green-900">Location Captured Successfully!</p>
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              </div>
              <p className="text-sm text-green-700 break-words mb-3">{formData.location.address}</p>
              <div className="bg-white/60 rounded-lg p-3 border border-green-200">
                <p className="text-xs font-medium text-green-800 mb-1">Coordinates:</p>
                <div className="flex items-center gap-2 text-xs font-mono text-green-700">
                  <span className="bg-green-100 px-2 py-1 rounded">
                    Lat: {formData.location.latitude.toFixed(6)}
                  </span>
                  <span className="bg-green-100 px-2 py-1 rounded">
                    Lng: {formData.location.longitude.toFixed(6)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">No location captured yet</p>
          <p className="text-xs text-gray-500">Click the button below to capture your current location</p>
        </div>
      )}

      {errors.location && (
        <div className="flex items-center justify-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-600 font-medium">{errors.location}</p>
        </div>
      )}

      <Button
        type="button"
        onClick={captureLocation}
        disabled={locationLoading}
        className={`
          w-full h-12 text-base font-medium shadow-md transition-all duration-200
          ${formData.location.latitude 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-orange-600 hover:bg-orange-700'
          }
        `}
      >
        {locationLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Capturing Location...</span>
          </>
        ) : (
          <>
            {formData.location.latitude ? (
              <>
                <Navigation className="mr-2 h-5 w-5" />
                <span>Recapture Location</span>
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-5 w-5" />
                <span>Capture My Location</span>
              </>
            )}
          </>
        )}
      </Button>
      
      {/* Info Card */}
      <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-orange-100 rounded-full p-2 shrink-0">
            <Navigation className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-sm text-orange-800">
            <p className="font-medium mb-1">Why location access?</p>
            <p className="text-xs text-orange-700">
              Your location helps us connect you with relevant properties in your area 
              and provide accurate service coverage information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Location;

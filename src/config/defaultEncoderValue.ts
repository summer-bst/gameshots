
const { StreamEncoder, StreamEncoderPreset_x264, StreamEncoderPreset_NVIDIA, StreamEncoderPreset_AMD_AMF } = overwolf.streaming.enums

const enum StreamEncoderPreset_Intel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
}

const defaultEncoderValue = {
    [StreamEncoder.INTEL]: StreamEncoderPreset_Intel.MEDIUM,
    [StreamEncoder.X264]: StreamEncoderPreset_x264.VERYFAST,
    [StreamEncoder.NVIDIA_NVENC]: StreamEncoderPreset_NVIDIA.DEFAULT,
    [StreamEncoder.NVIDIA_NVENC_NEW]: StreamEncoderPreset_NVIDIA.DEFAULT,
    [StreamEncoder.AMD_AMF]: StreamEncoderPreset_AMD_AMF.AUTOMATIC
}

export default defaultEncoderValue
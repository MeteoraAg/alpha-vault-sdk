#[derive(Copy, Clone, Debug, PartialEq, Eq)]
#[repr(u8)]
/// Type of the activation
pub enum ActivationType {
    Slot,
    Timestamp,
}

impl TryFrom<u8> for ActivationType {
    type Error = String;

    fn try_from(s: u8) -> std::result::Result<ActivationType, String> {
        match s {
            0 => Ok(ActivationType::Slot),
            1 => Ok(ActivationType::Timestamp),
            _ => Err("Invalid value".to_string()),
        }
    }
}

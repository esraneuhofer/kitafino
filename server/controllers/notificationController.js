const mongoose = require("mongoose");
const User = mongoose.model('Schooluser');

async function saveTokenFirebase(req, res, next) {
  const { token, deviceId, platform } = req.body;

  if (!token) {
    return res.status(400).send({ message: 'Token is required' });
  }

  try {
    // First check if this device already has a token
    let existingUser = await User.findById(req._id);
    let tokenExists = false;
    
    // Improved check for old token format
    if (existingUser && existingUser.token && existingUser.token.length > 0) {
      // Check if any tokens are in old format (strings)
      const hasOldFormat = existingUser.token.some(t => typeof t === 'string');
      
      if (hasOldFormat) {
        console.log('Found old token format for user ID:', req._id);
        
        // Store old tokens for logging purposes
        const oldTokensCount = existingUser.token.length;
        
        // Create new token array with new structure
        const newTokens = [];
        
        existingUser.token.forEach((oldToken, index) => {
          if (typeof oldToken === 'string') {
            newTokens.push({
              tokenValue: oldToken,
              deviceId: `migrated_device_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 10)}`,
              platform: 'migrated',
              lastUpdated: new Date()
            });
          } else if (oldToken && oldToken.tokenValue) {
            // Keep tokens that are already in new format
            newTokens.push(oldToken);
          }
        });
        
        // First clear all tokens
        await User.findByIdAndUpdate(req._id, 
          { $set: { token: [] } },
          { new: false }
        );
        
        // Then set the new tokens
        await User.findByIdAndUpdate(req._id, 
          { $set: { token: newTokens } },
          { new: true }
        );
        
        console.log(`Deleted ${oldTokensCount} old tokens and migrated to ${newTokens.length} new format tokens for user ID:`, req._id);
        
        // Refresh user object after migration
        existingUser = await User.findById(req._id);
      }
    }
    
    // After potential migration, check for existing device token
    if (existingUser && existingUser.token && deviceId) {
      // Find if this device already has a token
      const existingDeviceToken = existingUser.token.find(t => t && t.deviceId === deviceId);
      
      if (existingDeviceToken) {
        // Update existing token for this device
        await User.updateOne(
          { _id: req._id, "token.deviceId": deviceId },
          { 
            $set: { 
              "token.$.tokenValue": token,
              "token.$.platform": platform || 'unknown',
              "token.$.lastUpdated": new Date()
            } 
          }
        );
        tokenExists = true;
        console.log('Updated existing token for device:', deviceId);
      }
    }
    
    // If token doesn't exist for this device or no deviceId provided (legacy case), add it
    if (!tokenExists) {
      if (deviceId) {
        // New format with deviceId
        await User.findByIdAndUpdate(
          req._id,
          { 
            $push: { 
              token: {
                tokenValue: token,
                deviceId: deviceId,
                platform: platform || 'unknown',
                lastUpdated: new Date()
              } 
            } 
          }
        );
        console.log('Added new token with device ID:', deviceId);
      } else {
        // Even for legacy clients without deviceId, still use new format
        await User.findByIdAndUpdate(
          req._id,
          { 
            $push: { 
              token: {
                tokenValue: token,
                deviceId: `auto_device_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
                platform: platform || 'unknown',
                lastUpdated: new Date()
              } 
            } 
          }
        );
        console.log('Added new token with auto-generated device ID');
      }
    }

    console.log('Token saved successfully:', token);
    res.status(200).send({ message: 'Token saved successfully' });
  } catch (error) {
    console.error('Error saving token:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
}

async function deleteSpecificTokenFirebase(req, res, next) {
  const { token, deviceId } = req.body;
  
  try {
    // If deviceId is provided, delete by deviceId (new format)
    if (deviceId) {
      await User.findOneAndUpdate(
        { _id: req._id },
        { $pull: { token: { deviceId: deviceId } } }
      );
    } 
    // If only token is provided (old or new format)
    else if (token) {
      // Try to delete as new format first
      const resultNew = await User.findOneAndUpdate(
        { _id: req._id },
        { $pull: { token: { tokenValue: token } } }
      );
      
      // If that didn't find anything, try the old format
      if (!resultNew || !resultNew.token || resultNew.token.length === 0) {
        await User.findOneAndUpdate(
          { _id: req._id },
          { $pull: { token: token } }  // Direct string pull for old format
        );
      }
    } else {
      return res.status(400).send({ message: 'Token or deviceId is required' });
    }

    console.log('Token deleted successfully.');
    res.status(200).send({ message: 'Token deleted successfully' });
  } catch (error) {
    console.error('Error deleting token:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
}

module.exports = {
  deleteSpecificTokenFirebase,
  saveTokenFirebase
};

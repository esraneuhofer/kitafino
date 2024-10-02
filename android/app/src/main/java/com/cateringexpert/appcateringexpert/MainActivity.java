package com.cateringexpert.appcateringexpert;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Erstellen der Notification Channels für Android 8.0 und höher
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Erster Kanal: default_channel_id
            String defaultChannelId = "default_channel_id";
            String defaultChannelName = "Standard Kanal";
            String defaultChannelDescription = "Channel für Standard-Benachrichtigungen";
            int importance = NotificationManager.IMPORTANCE_HIGH;

            NotificationChannel defaultChannel = new NotificationChannel(defaultChannelId, defaultChannelName, importance);
            defaultChannel.setDescription(defaultChannelDescription);

            // Zweiter Kanal: cateringexpert_channel_id
            String cateringExpertChannelId = "cateringexpert_channel_id"; // Deine spezifische Channel ID
            String cateringExpertChannelName = "Catering Expert Benachrichtigungen";
            String cateringExpertChannelDescription = "Channel für Catering Expert Benachrichtigungen";
            int cateringExpertImportance = NotificationManager.IMPORTANCE_HIGH;

            NotificationChannel cateringExpertChannel = new NotificationChannel(cateringExpertChannelId, cateringExpertChannelName, cateringExpertImportance);
            cateringExpertChannel.setDescription(cateringExpertChannelDescription);

            // Registriere die Kanäle beim NotificationManager
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(defaultChannel); // Registriere den Standardkanal
                manager.createNotificationChannel(cateringExpertChannel); // Registriere den Catering-Expert-Kanal
            }
        }
    }
}

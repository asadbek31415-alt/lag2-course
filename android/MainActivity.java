package uz.turinprepnik.lag2;

import android.os.Bundle;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (bridge == null) {
                    finish();
                    return;
                }
                bridge.getWebView().evaluateJavascript(
                    "Boolean(window.LAG2Back && window.LAG2Back())",
                    handled -> { if (!"true".equals(handled)) finish(); }
                );
            }
        });
    }
}

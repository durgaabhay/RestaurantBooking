package project1.group1.restaurantbooking;

import android.app.ProgressDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

import com.google.gson.JsonObject;
import com.squareup.okhttp.Callback;
import com.squareup.okhttp.MediaType;
import com.squareup.okhttp.OkHttpClient;
import com.squareup.okhttp.Request;
import com.squareup.okhttp.RequestBody;
import com.squareup.okhttp.Response;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;


public class MainActivity extends AppCompatActivity {

    EditText userName, password;
    public static final String MANAGER_ROLE  = "MANAGER";
    public static final String EMPLOYEE_ROLE = "EMPLOYEE";
    private final OkHttpClient client = new OkHttpClient();
    JSONObject tokenObject;
    String token;
    ProgressDialog progressDialog;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        userName = findViewById(R.id.userName);
        password = findViewById(R.id.textPassword);

        findViewById(R.id.btnSignIn).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                validateFields(userName.getText().toString(),password.getText().toString());
            }
        });
    }

    private void validateFields(String userName, String password) {
        if(userName ==null || userName.length()==0){
            Toast.makeText(getApplicationContext(),"Invalid user name", Toast.LENGTH_SHORT).show();
        }else if(password == null || password.length() == 0){
            Toast.makeText(getApplicationContext(),"Invalid password", Toast.LENGTH_SHORT).show();
        }else{
            progressDialog = new ProgressDialog(MainActivity.this);
            progressDialog.setProgressStyle(ProgressDialog.STYLE_SPINNER);
            progressDialog.setTitle("Signing Up....");
            progressDialog.show();
            signInUser(userName,password);
        }
    }

    private void signInUser(String userName, String password) {
        MediaType JSON = MediaType.parse("application/json;charset=utf-8");
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("userName",userName);
        jsonObject.addProperty("password",password);
        jsonObject.addProperty("userRole",MANAGER_ROLE);
        RequestBody formBody = RequestBody.create(JSON,jsonObject.toString());
        Log.d("demo", "performLogin: " + formBody.toString());
        final Request request = new Request.Builder().url("http://192.168.0.13:3000/admin/login")
                .header("Content-Type","application/json")//replace the ip here
                .post(formBody)
                .build();
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Request request, IOException e) {
                Log.d("demo", "onFailure: " + e.getMessage());
            }

            @Override
            public void onResponse(Response response) throws IOException {
                if(response.code() == 200){
                    try{
                        tokenObject = new JSONObject(response.body().string());
                        token  = tokenObject.getString("token");
                        Log.d("demo", "Token data from server: " + token );
                        Log.d("test", "onResponse: Successful Login" + response.body().toString());
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                progressDialog.dismiss();
                                createSession();
                                Intent survey = new Intent(MainActivity.this,UserActivity.class);
                                survey.putExtra("token",token);
                                startActivity(survey);
                                finish();
                            }
                        });
                    }catch(JSONException jsonExp){
                        jsonExp.printStackTrace();
                    }
                }else{
                    try{
                        tokenObject = new JSONObject(response.body().string());
                        String message  = tokenObject.getString("message");
                        Toast.makeText(getApplicationContext(),message,Toast.LENGTH_SHORT).show();
                    }catch(JSONException e){
                        e.printStackTrace();
                    }
                }

            }

        });
    }

    private void createSession() {
        SharedPreferences sharedPreferences = getSharedPreferences("My_Pref",MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString("userToken",token);
        editor.commit();
    }
}

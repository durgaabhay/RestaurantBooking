package project1.group1.restaurantbooking.data;

import android.util.Log;

import java.io.Serializable;

public class CustomerInfo implements Serializable {


        String _id;
        String userName,email,phoneNumber;

        public CustomerInfo() {
        }

        @Override
        public String toString() {
            return "CustomerInfo{" +
                    "_id=" + _id +
                    ", userName='" + userName + '\'' +
                    ", email='" + email + '\'' +
                    ", phoneNumber='" + phoneNumber + '\'' +
                    '}';
        }

        public String get_id() {
            return _id;
        }

        public void set_id(String _id) {
            this._id = _id;
        }

        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }

}

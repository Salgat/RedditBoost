module utils {
    export class Cookies {
        /**
         * Sets a cookie with the key-value pair, with expireAfter indicating how many minutes to expire after (default 1 week).
         */
        public static setCookie(key: string, value: string, expireAfter = 60*24*7) : void {
            var expires = new Date();
            expires.setTime(expires.getTime() + (expireAfter * 60 * 1000));
            document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
        }
        
        /**
         * Gets a cookie using the provided key. Null is returned if no value exists.
         */
        public static getCookie(key) : string {
            var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
            return keyValue ? keyValue[2] : null;
        }
    }
}
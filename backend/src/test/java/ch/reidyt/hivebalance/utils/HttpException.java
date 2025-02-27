package ch.reidyt.hivebalance.utils;

import org.springframework.http.HttpStatusCode;

public class HttpException extends RuntimeException {
    public final HttpStatusCode httpStatusCode;

    public HttpException(HttpStatusCode httpStatusCode) {
        super("HttpException");
        this.httpStatusCode = httpStatusCode;
    }
}

<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BugController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/users', function () {
        return \App\Models\User::select('id', 'name', 'role')->get();
    });

    Route::apiResource('bugs', BugController::class);
    Route::apiResource('tasks', \App\Http\Controllers\TaskController::class);
});

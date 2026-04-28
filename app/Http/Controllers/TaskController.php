<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    /**
     * List all tasks, with optional filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Task::with(['reporter:id,name', 'assignee:id,name']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('assignee_id')) {
            $query->where('assignee_id', $request->assignee_id);
        }

        $tasks = $query->latest()->paginate(15);

        return response()->json($tasks);
    }

    /**
     * Create a new task.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'priority'    => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'deadline'    => 'nullable|date',
            'assignee_id' => 'nullable|exists:users,id',
        ]);

        $validated['reporter_id'] = $request->user()->id;
        $validated['status'] = 'open';

        $task = Task::create($validated);
        $task->load(['reporter:id,name', 'assignee:id,name']);

        return response()->json($task, 201);
    }

    /**
     * Show a single task.
     */
    public function show(Task $task): JsonResponse
    {
        $task->load(['reporter:id,name,email', 'assignee:id,name,email']);

        return response()->json($task);
    }

    /**
     * Update a task.
     */
    public function update(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'status'      => ['sometimes', Rule::in(['open', 'in_progress', 'resolved'])],
            'priority'    => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'deadline'    => 'nullable|date',
            'assignee_id' => 'nullable|exists:users,id',
        ]);

        $task->update($validated);
        $task->load(['reporter:id,name', 'assignee:id,name']);

        return response()->json($task);
    }

    /**
     * Delete a task.
     */
    public function destroy(Task $task): JsonResponse
    {
        $task->delete();

        return response()->json(['message' => 'Task deleted successfully.']);
    }
}

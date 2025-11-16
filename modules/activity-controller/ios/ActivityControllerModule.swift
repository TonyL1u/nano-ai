import ExpoModulesCore
import ActivityKit


final class ActivityUnavailableException: GenericException<Void> {
  override var reason: String { "Live activities are not available on this system." }
}
final class ActivityDataException: GenericException<String> {
  override var reason: String { "Failed to parse Live Activity data: \(param)" }
}


fileprivate struct StartParams: Decodable {
  let question: String
  let model: String
}

fileprivate struct ActivityStatus: Decodable {
  let isPending: Bool
  let isThinking: Bool
  let isStreaming: Bool
  let isAborted: Bool
}

fileprivate struct UpdateParams: Decodable {
  let status: ActivityStatus

  private enum CodingKeys: String, CodingKey {
    case status
    case isPending
    case isThinking
    case isStreaming
    case isAborted
  }

  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    if container.contains(.status) {
      status = try container.decode(ActivityStatus.self, forKey: .status)
    } else {
      let isPending = try container.decode(Bool.self, forKey: .isPending)
      let isThinking = try container.decode(Bool.self, forKey: .isThinking)
      let isStreaming = try container.decode(Bool.self, forKey: .isStreaming)
      let isAborted = try container.decode(Bool.self, forKey: .isAborted)

      status = ActivityStatus(
        isPending: isPending,
        isThinking: isThinking,
        isStreaming: isStreaming,
        isAborted: isAborted
      )
    }
  }
}


public class ActivityControllerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ActivityController")

    Property("areLiveActivitiesEnabled") {
      if #available(iOS 16.2, *) {
        return ActivityAuthorizationInfo().areActivitiesEnabled
      }
      return false
    }

    AsyncFunction("startLiveActivity") { (rawData: String) async throws -> Void in
      guard #available(iOS 16.2, *) else {
        throw ActivityUnavailableException(())
      }
      let data = Data(rawData.utf8)
      let params: StartParams
      do {
        params = try JSONDecoder().decode(StartParams.self, from: data)
      } catch {
        throw ActivityDataException(rawData)
      }

      guard Activity<ChatAttributes>.activities.isEmpty else {
        throw ActivityUnavailableException(())
      }
      guard ActivityAuthorizationInfo().areActivitiesEnabled else {
        throw ActivityUnavailableException(())
      }

      let attrs = ChatAttributes(
        question: params.question,
        model: params.model,
      )
      let state = ChatAttributes.ContentState(
        isPending: true,
        isThinking: false,
        isStreaming: false,
        isAborted: false
      )

      _ = try Activity<ChatAttributes>.request(
        attributes: attrs,
        contentState: state,
        pushType: nil
      )
    }

    AsyncFunction("updateLiveActivity") { (rawData: String) async throws -> Void in
      guard #available(iOS 16.2, *) else {
        throw ActivityUnavailableException(())
      }
      guard let activity = Activity<ChatAttributes>.activities.first else {
        throw ActivityUnavailableException(())
      }
      let data = Data(rawData.utf8)
      let params: UpdateParams
      do {
        params = try JSONDecoder().decode(UpdateParams.self, from: data)
      } catch {
        throw ActivityDataException(rawData)
      }

      let updatedState = ChatAttributes.ContentState(
        isPending: params.status.isPending,
        isThinking: params.status.isThinking,
        isStreaming: params.status.isStreaming,
        isAborted: params.status.isAborted
      )

      await activity.update(using: updatedState)
    }

    AsyncFunction("stopLiveActivity") { () async throws -> Void in
      guard #available(iOS 16.2, *) else {
        throw ActivityUnavailableException(())
      }
      guard let activity = Activity<ChatAttributes>.activities.first else {
        throw ActivityUnavailableException(())
      }
      await activity.end(dismissalPolicy: .immediate)
    }

    Function("isLiveActivityRunning") { () -> Bool in
      if #available(iOS 16.2, *) {
        return !Activity<ChatAttributes>.activities.isEmpty
      }
      return false
    }
  }
}
